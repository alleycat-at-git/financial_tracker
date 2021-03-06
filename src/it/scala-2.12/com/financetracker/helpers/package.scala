package com.financetracker

import org.http4s._
import org.http4s.client.blaze._
import org.http4s.headers._
import fs2.Task
import fs2.interop.cats._
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import io.circe._
import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import org.slf4j.LoggerFactory
import java.sql.Timestamp

import com.typesafe.config._
import com.financetracker.env._
import com.financetracker.data._
import com.financetracker.repo._
import com.financetracker.types._

package object helpers {
  lazy val httpClient = PooledHttp1Client()
  lazy val baseUrl: Uri = Uri.fromString(s"http://${env.http.host}:${env.http.port}/api/v1").right.get
  lazy val env = Env.createEnv(EnvType.Test).run(config).right.get

  val serviceClean: TaskAttempt[Unit] =
    for {
      _ <- env.expenseRepo.deleteAll
      _ <- env.userRepo.deleteAll
    } yield (())

  val serviceWithUsers: TaskAttempt[Map[Role, User]] =
    for {
      _ <- serviceClean
      admin <- env.userRepo.create(Provider.Email, Identity("admin@gmail.com"), Password("admin"), Role.Admin)
      manager <- env.userRepo.create(Provider.Email, Identity("manager@gmail.com"), Password("manager"), Role.Manager)
      user <- env.userRepo.create(Provider.Email, Identity("user@gmail.com"), Password("user"), Role.User)
      expense1 <- env.expenseRepo.create(Amount(100), Description("Admin McDonalds"), Some(Comment("Big Mac")), OccuredAt(new Timestamp(0)), admin.id)
      expense2 <- env.expenseRepo.create(Amount(200), Description("Admin Shoes"), None, OccuredAt(new Timestamp(5000)), admin.id)
      expense3 <- env.expenseRepo.create(Amount(100), Description("Manager McDonalds"), Some(Comment("Big Mac")), OccuredAt(new Timestamp(0)), manager.id)
      expense4 <- env.expenseRepo.create(Amount(200), Description("Manager Shoes"), None, OccuredAt(new Timestamp(5000)), manager.id)
      expense5 <- env.expenseRepo.create(Amount(100), Description("User McDonalds"), Some(Comment("Big Mac")), OccuredAt(new Timestamp(0)), user.id)
      expense6 <- env.expenseRepo.create(Amount(200), Description("User Shoes"), None, OccuredAt(new Timestamp(5000)), user.id)
    } yield Map(Role.Admin -> admin, Role.Manager -> manager, Role.User -> user)

  def loggedInUser(role: Role): TaskAttempt[(User, JWToken, List[User])] =
    for {
      users <- serviceWithUsers
      user = users(role)
      token <- env.sessionService.login(user.identity, user.password)
    } yield (user, token, users.values.toList)

  def compareJsonsIgnoring(ignoreList: List[String])(json1: Json, json2: Json): Boolean = {
    if (json1.isObject) {
      if (!json2.isObject) return false
      val obj1 = json1.asObject.get
      val obj2 = json2.asObject.get
      if (obj1.fieldSet != obj2.fieldSet) return false
      return (obj1.fieldSet -- ignoreList).foldRight(true)((field, res) => res && compareJsonsIgnoring(ignoreList)(obj1(field).get, obj2(field).get))
    }
    if (json1.isArray) {
      if (!json2.isArray) return false
      val arr1 = json1.asArray.get
      val arr2 = json2.asArray.get
      if (arr1.size != arr2.size) return false
      return arr1.zip(arr2).foldRight(true)((tuple, res) => res && compareJsonsIgnoring(ignoreList)(tuple._1, tuple._2))
    }
    json1 == json2
  }

  def authHeader(token: JWToken): Headers = 
    Headers(Header("authorization", s"Bearer ${token.value}"))

  def async[A](task: TaskAttempt[A]): A = Await.result(task.value.unsafeRunAsyncFuture, timeout) match {
    case Left(e) => throw e
    case Right(x) => x
  }
  private lazy val config = { 
    val root: Logger = LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME).asInstanceOf[Logger]
    root.setLevel(Level.ERROR)
    ConfigFactory.load()
  }

  private val timeout = 20000.millis
}
