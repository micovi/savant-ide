import * as React from 'react';
import { Zilliqa } from '@zilliqa-js/zilliqa';

interface Props {
    address: string;
    network: string;
    type: 'init' | 'state';
}

interface State {
    filled: any;
}

export default class StateCaller extends React.Component<Props, State> {
    state: State = {
        filled: false
    };
    onClick: React.MouseEventHandler<HTMLAnchorElement> = async (e) => {
        e.preventDefault();

        const { address, network, type } = this.props;

        const zilliqa = new Zilliqa(network);

        const result = (type === 'init') ? await zilliqa.blockchain.getSmartContractInit(address) : await zilliqa.blockchain.getSmartContractState(address);


        this.setState({
            filled: result.result
        });

    }

    render() {
        const { filled } = this.state;

        return (
            <React.Fragment>
                {!filled ? (<a href="#" onClick={this.onClick}>Call</a>) : (
                    <pre>{JSON.stringify(filled, null, 1)}</pre>
                )}
            </React.Fragment>
        );
    }
}
