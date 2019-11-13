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

interface Validator {
  type: string;
  match: (type: string) => boolean;
  validatorFn: (value: string) => boolean;
}

const Matchers: { [type: string]: RegExp } = {
  ByStrX: /^ByStr[0-9]*$/,
  String: /^String$/,
  Uint: /^Uint(32|64|128|256)$/,
  Int: /^Int(32|64|128|256)$/,
  BNum: /^BNum$/,
  List: /^List (ByStr20)$/
};

const Validators: { [type: string]: RegExp } = {
  ByStrX: /^0x[a-fA-F0-9]+$/i,
  String: /\w+/i,
  Uint: /^[0-9]+$/,
  Int: /^(-|\+)?[0-9]+$/,
  BNum: /^[1-9]([0-9])*$/,
  List: /\w+/i
};

const validators: Validator[] = [
  {
    type: 'ByStrX',
    match: (type: string) => Matchers.ByStrX.test(type),
    validatorFn: (value) => Validators.ByStrX.test(value),
  },
  {
    type: 'UInt',
    match: (type: string) => Matchers.Uint.test(type),
    validatorFn: (value) => Validators.Uint.test(value),
  },
  {
    type: 'Int',
    match: (type: string) => Matchers.Int.test(type),
    validatorFn: (value) => Validators.Int.test(value),
  },
  {
    type: 'BNum',
    match: (type: string) => Matchers.BNum.test(type),
    validatorFn: (value) => Validators.BNum.test(value),
  },
  {
    type: 'String',
    match: (type: string) => Matchers.String.test(type),
    validatorFn: (value) => Validators.String.test(value),
  },
];

export const validate = (type: string, value: string) => {
  return validators.some((val) => val.match(type) && val.validatorFn(value));
};
