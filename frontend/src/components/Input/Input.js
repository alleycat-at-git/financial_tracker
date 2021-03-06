import React from 'react';
import PropTypes from 'prop-types';
import DateTime from 'react-datetime';
import moment from 'moment';
import { map } from 'ramda';

const DateInput = (props) => {
  const format = 'YYYY-MM-DD HH:mm';
  const date = props.value ? moment(props.value, format) : '';
  return (
    <div className="avenir">
      <p>
        {props.value}
        {props.value && <a className="pointer underline ml3" onClick={() => props.onChange('')}>Reset</a>}
      </p>
      <DateTime
        input={false}
        value={date || null}
        onChange={date1 => props.onChange(date1.format(format))}
      />
    </div>
  );
};

const SelectInput = props => (
  <select
    className="w-100 mv2"
    value={props.value}
    onChange={e => props.onChange(e.target.value)}
  >
    {map(value => <option key={value} value={value}>{value}</option>, props.options)}
  </select>
);

const StandardInput = props => {
  const fontClass = props.small ? 'f5' : 'f4';
  return (
    <input
      className={`${fontClass} mid-gray pv1 mb2 w-100 input-reset outline-0 bb bt-0 br-0 bl-0 b--gray lh-copy`}
      value={props.value}
      type={props.type}
      onChange={e => props.onChange(e.target.value)}
    />
  );
}

const Input = (props) => {
  switch (props.type) {
    case 'date':
      return <DateInput {...props} />;
    case 'select':
      return <SelectInput {...props} />;
    default:
      return <StandardInput {...props} />;
  }
};

Input.defaultProps = {
  type: 'text',
  value: null,
  small: false,
  options: [],
};

Input.propTypes = {
  value: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  small: PropTypes.bool,
};

DateInput.propTypes = Input.propTypes;

export default Input;
