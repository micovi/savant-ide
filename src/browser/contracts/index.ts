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

import auction from './auction.scilla';
import bookstore from './bookstore.scilla';
import crowdfunding from './crowdfunding.scilla';
import ecdsa from './ecdsa.scilla';
import fungibleToken from './fungible_token.scilla';
import helloWorld from './hello_world.scilla';
import nonFungibleToken from './nonfungible_token.scilla';
import schnorr from './schnorr.scilla';
import zilGame from './zil_hash_game.scilla';

interface ScillaSrc {
  name: string;
  src: string;
}

export const defaultContracts: ScillaSrc[] = [
  { name: 'HelloWorld', src: helloWorld },
  { name: 'BookStore', src: bookstore },
  { name: 'CrowdFunding', src: crowdfunding },
  { name: 'Auction', src: auction },
  { name: 'FungibleToken', src: fungibleToken },
  { name: 'NonFungible', src: nonFungibleToken },
  { name: 'ZilGame', src: zilGame },
  { name: 'SchnorrTest', src: schnorr },
  { name: 'ECDSATest', src: ecdsa },
];
