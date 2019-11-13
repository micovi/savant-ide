/**
 * This file is part of savant-ide.
 * Copyright (c) 2018 - present Zilliqa Research Pte. Ltd.
 *
 * savant-ide is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * savant-ide is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * savant-ide.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';

import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';

import styled from 'styled-components';

import Loader from '../Loader';
import TxParams from '../Form/TxParams';
import InputWrapper from '../Form/InputWrapper';
import { RunnerResult, Param } from '../../store/contract/types';
import { isField, Field, MsgField, FieldDict, MsgFieldDict } from '../../util/form';
import { formatError } from '../../util/api';
import { validate as valid } from '../../util/validation';

const StatusWrapper = styled.div`
  width: 100%;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    width: 100%;
    text-align: center;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  .form {
    flex: 1 0 auto;
    margin: 2em 0;
  }
`;

interface Props {
  abiParams: Param[];
  result: RunnerResult | null;
  handleSubmit: (init: FieldDict, msg: MsgFieldDict) => void;
  handleReset: () => void;
  isDeploying: boolean;
}

interface State {
  init: FieldDict;
  msg: MsgFieldDict;
}

export default class InitForm extends React.Component<Props, State> {
  state: State = {
    init: this.props.abiParams.reduce(
      (acc, { vname, type }) => ({
        ...acc,
        [vname]: { value: '', type, touched: false, error: false },
      }),
      {},
    ),
    msg: {
      _amount: { value: '0', touched: false, error: false },
      gaslimit: { value: '5000', touched: false, error: false },
      gasprice: { value: 1000000000, touched: false, error: false },
    },
  };

  handleSubmit: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    const { init, msg } = this.state;

    let canSubmit = true;

    const validatedInit = Object.keys(init).reduce((acc, name) => {
      const field = init[name];
      const isValid = this.validate(field, true);

      if (!isValid) {
        canSubmit = false;
      }

      return { ...acc, [name]: { ...field, error: !isValid } };
    }, init);

    const validatedMsg = Object.keys(msg).reduce((acc, name) => {
      const field = msg[name];
      const isValid = this.validate(field, true);

      if (!isValid) {
        canSubmit = false;
      }

      return { ...acc, [name]: { ...field, error: !isValid } };
    }, msg);

    if (!canSubmit) {
      this.setState({ init: validatedInit, msg: validatedMsg });
      return;
    }

    this.props.handleSubmit(init, msg);
  };

  handleInitChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    const { init } = this.state;

    const currentField = init[name];
    const baseField = { ...currentField, value, touched: true };
    const isValid = this.validate(baseField);
    const newField = {
      ...baseField,
      error: !isValid,
    };
    const newInit = { ...init, [name]: newField };

    this.setState({ init: newInit });
  };

  handleMsgChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    const { msg } = this.state;

    const currentField = msg[name];
    const baseField = { ...currentField, value, touched: true };
    const isValid = this.validate(baseField);
    const newField = { ...baseField, error: !isValid };
    const newMsg = { ...msg, [name]: newField };

    this.setState({ msg: newMsg });
  };

  handleGasPriceChange = (_: any, value: any) => {
    this.setState({ msg: { ...this.state.msg, gasprice: { error: false, touched: true, value } } });
  };

  validate = (field: Field | MsgField, ignoreTouched: boolean = false): boolean => {
    if (!field) {
      return false;
    }

    if (!field.touched && !ignoreTouched) {
      return true;
    }

    console.log(field);

    if (isField(field)) {
      return valid(field.type, field.value);
    }

    return valid('Uint128', field.value);
  };

  componentDidUpdate(nextProps: Props) {
    // we hit the reset button; clear out form state.
    if (!nextProps.result && nextProps.result !== this.props.result) {
      this.setState({
        init: {},
        msg: {},
      });
    }
  }

  render() {
    const { abiParams, result, handleReset } = this.props;
    const { init, msg } = this.state;

    if (this.props.isDeploying) {
      return <Loader delay={1001} message="Deploying contract..." />;
    }

    if (result && result.status === 0) {
      return (
        <StatusWrapper>
          <Typography variant="body2" align="left">
            {`Your contract was successfully deployed to 0x${result.address}`}
          </Typography>
          <Typography variant="body2" align="left" style={{ whiteSpace: 'pre' }}>
            {`Gas used: ${result.gasUsed}\nGas price: ${
              result.gasPrice
            }\nTransaction cost: ${result.gasUsed * result.gasPrice}`}
          </Typography>
          <Button
            color="primary"
            variant="extendedFab"
            aria-label="reset"
            onClick={handleReset}
            style={{ margin: '3.5em 0' }}
          >
            Reset
          </Button>
        </StatusWrapper>
      );
    }

    if (result && result.status === 1) {
      return (
        <StatusWrapper>
          <Typography color="error" variant="body2" style={{ whiteSpace: 'pre-line' }}>
            {`Failed to deploy contract. The following error occured:

              ${result.error.response ? formatError(result.error.response.message) : result.error}

            Please double check your deployment parameters and try again.
            `}
          </Typography>
          <Button
            variant="extendedFab"
            color="primary"
            aria-label="reset"
            onClick={handleReset}
            style={{ margin: '3.5em 0' }}
          >
            Reset
          </Button>
        </StatusWrapper>
      );
    }

    return (
      <Wrapper>
        <Typography align="left" gutterBottom variant="title">
          Transaction Parameters:
        </Typography>
        <TxParams
          values={msg}
          handleMsgChange={this.handleMsgChange}
          handleGasPriceChange={this.handleGasPriceChange}
        />
        {abiParams.length ? (
          <FormGroup classes={{ root: 'form' }}>
            <Typography align="left" gutterBottom variant="title">
              Initialisation Parameters:
            </Typography>
            {abiParams.map(({ vname, type }) => {
              const field = init[vname];

              return (
                field && (
                  <InputWrapper key={vname} error={field.error}>
                    <InputLabel htmlFor={vname}>{`${vname} (${type})`}</InputLabel>
                    <Input
                      onChange={this.handleInitChange}
                      id={vname}
                      name={vname}
                      value={field.value}
                    />
                    {field.error && <FormHelperText>Please fill in a value</FormHelperText>}
                  </InputWrapper>
                )
              );
            })}
          </FormGroup>
        ) : null}
        <Button
          color="primary"
          variant="extendedFab"
          aria-label="Add Contract"
          onClick={this.handleSubmit}
          style={{ margin: '3.5em 0' }}
        >
          Deploy
        </Button>
      </Wrapper>
    );
  }
}
