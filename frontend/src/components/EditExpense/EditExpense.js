import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import InputGroup from '../InputGroup';
import Button from '../Button';

import thunks from '../../thunks';
import { getExpensesForm, getExpensesErrors, getExpensesLoading, getEditingFocus } from '../../selectors/expenses';

const EditExpense = (props) => {
  if (props.hidden) return null;
  return (
    <div className="flex flex-column mh2 mw6-l w-100-m">
      <div className="pa3-ns pa1 ba b--light-gray">
        <InputGroup
          label="Amount"
          value={props.form.amount}
          errors={props.errors.amount}
          small
          type="number"
          onChange={text => props.updateFormExpenses({ amount: text })}
        />
        <InputGroup
          label="Description"
          value={props.form.description}
          errors={props.errors.description}
          small
          onChange={text => props.updateFormExpenses({ description: text })}
        />
        <InputGroup
          label="Date"
          value={props.form.occuredAt}
          type="date"
          errors={props.errors.occuredAt}
          small
          onChange={text => props.updateFormExpenses({ occuredAt: text })}
        />
        <InputGroup
          label="Comment"
          value={props.form.comment}
          errors={props.errors.comment}
          small
          onChange={text => props.updateFormExpenses({ comment: text })}
        />
        <Button
          title={props.submitTitle}
          className="mb3 w-100"
          color="green"
          disabled={props.loading}
          onClick={() => {
            if (props.expenseId) {
              props.updateExpense(props.match.params.userId, props.expenseId, props.history);
            } else {
              props.createExpense(props.match.params.userId, props.history);
            }
          }}
        />
      </div>
    </div>
  );
};

EditExpense.propTypes = {
  form: PropTypes.shape({
    occuredAt: PropTypes.string,
    amount: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      userId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  hidden: PropTypes.bool,
  submitTitle: PropTypes.string.isRequired,
  expenseId: PropTypes.number,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  updateFormExpenses: PropTypes.func.isRequired,
  createExpense: PropTypes.func.isRequired,
  updateExpense: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  form: getExpensesForm(state),
  errors: getExpensesErrors(state),
  loading: getExpensesLoading(state),
  expenseId: getEditingFocus(state),
});

const mapDispatchToProps = {
  updateFormExpenses: thunks.updateFormExpenses,
  createExpense: thunks.createExpense,
  updateExpense: thunks.updateExpense,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditExpense);
