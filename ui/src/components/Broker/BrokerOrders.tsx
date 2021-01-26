import React, { useState } from 'react'
import { Button, Card, Form, Header } from 'semantic-ui-react'

import { useParty, useLedger } from '@daml/react'

import { Order, BrokerOrderRequest, BrokerOrder } from '@daml.js/da-marketplace/lib/Marketplace/Trading'

import { ContractId } from '@daml/types'

import { ExchangeIcon, OrdersIcon } from '../../icons/Icons'
import { useContractQuery } from '../../websocket/queryStream'

import { DepositInfo, unwrapDamlTuple, wrapDamlTuple } from '../common/damlTypes'
import FormErrorHandled from '../common/FormErrorHandled'
import ExchangeOrderCard from '../common/ExchangeOrderCard'
import PageSection from '../common/PageSection'
import Page from '../common/Page'

type Props = {
    sideNav: React.ReactElement;
    deposits: DepositInfo[];
    onLogout: () => void;
};


const BrokerOrders: React.FC<Props> = ({ sideNav, deposits, onLogout }) => {
    const allExchangeOrders = useContractQuery(Order);
    const allBrokerOrderRequests = useContractQuery(BrokerOrderRequest);
    const allBrokerOrders = useContractQuery(BrokerOrder);

    return (
        <Page
            sideNav={sideNav}
            menuTitle={<><OrdersIcon size='24'/>Orders</>}
            onLogout={onLogout}
        >
            <PageSection>
                <div className='broker-orders'>
                    <div className='order-section'>
                        <Header as='h2'>Requested Orders</Header>
                        { allBrokerOrderRequests.length > 0 ?
                            allBrokerOrderRequests.map(or => <BrokerOrderRequestCard key={or.contractId} cid={or.contractId} cdata={or.contractData}/>)
                            :
                            <i>none</i>
                        }
                    </div>
                    <div className='order-section'>
                        <Header as='h2'>Open Orders</Header>
                        { allBrokerOrders.length > 0 ?
                            allBrokerOrders.map(o => <BrokerOrderCard key={o.contractId} cdata={o.contractData} deposits={deposits}/>)
                            :
                            <i>none</i>
                        }
                    </div>
                    <div className='order-section'>
                        <Header as='h2'>Exchange Orders</Header>
                        { allExchangeOrders.length > 0 ?
                            allExchangeOrders.map(o => <ExchangeOrderCard key={o.contractId} order={o.contractData}/>)
                            :
                            <i>none</i>
                        }
                    </div>
                </div>
            </PageSection>
        </Page>
    )
};

type BrokerOrderRequestCardProps = {
    cid: ContractId<BrokerOrderRequest>;
    cdata: BrokerOrderRequest;
};

const BrokerOrderRequestCard: React.FC<BrokerOrderRequestCardProps> = ({children, ...props}) => {
    const [ brokerOrderId, setBrokerOrderId ] = useState<string>('');
    const ledger = useLedger();

    const [ base, quote ] = unwrapDamlTuple(props.cdata.pair).map(t => t.label);
    const label = props.cdata.isBid ? `Buy ${base}/${quote}` : `Sell ${base}/${quote}`;
    const amount = props.cdata.isBid ? `+ ${props.cdata.qty} ${base}` : `- ${props.cdata.qty} ${base}`;
    const customer = props.cdata.brokerCustomer;
    const depositCid = props.cdata.depositCid;
    const price = `${props.cdata.price} ${quote}`;

    const handleAcceptBrokerOrderRequest = async () => {
        const args = { brokerOrderId };
        await ledger.exercise(BrokerOrderRequest.BrokerOrderRequest_Accept, props.cid, args);

        setBrokerOrderId('');
    }

    return (
        <FormErrorHandled
            className='order-card-container'
            onSubmit={handleAcceptBrokerOrderRequest}
        >
            <div className='order-card-container'>
                <Card fluid className='order-card'>
                    <div className='order-info'>
                        <div><ExchangeIcon/> {label}</div>
                        <div>{ amount }</div>
                        <div>{`@ ${price}`}</div>
                        <div>{`customer: ${customer}`}</div>
                        <div>{`deposit: ${depositCid.substr(depositCid.length - 8)}`}</div>
                    </div>
                    <div className='actions'>
                        <Form.Group>
                            <Form.Input
                                className='orderid-input'
                                placeholder='id'
                                value={brokerOrderId}
                                onChange={e => setBrokerOrderId(e.currentTarget.value)}
                            />
                            <Button
                                className='ghost'
                                content='Accept Order'
                            />
                        </Form.Group>
                    </div>
                </Card>
            </div>
        </FormErrorHandled>
    )
};

type BrokerOrderCardProps = {
    cdata: BrokerOrder;
    deposits: DepositInfo[];
};

const BrokerOrderCard: React.FC<BrokerOrderCardProps> = (props) => {
    const [ depositCid, setDepositCid ] = useState<string>('');
    const broker = useParty();
    const ledger = useLedger();

    const [ base, quote ] = unwrapDamlTuple(props.cdata.pair).map(t => t.label);
    const label = props.cdata.isBid ? `Buy ${base}/${quote}` : `Sell ${base}/${quote}`;
    const amount = props.cdata.isBid ? `+ ${props.cdata.qty} ${base}` : `- ${props.cdata.qty} ${base}`;
    const price = `${props.cdata.price} ${quote}`;

    const customer = props.cdata.brokerCustomer;

    const options = props.deposits
    .filter(deposit => deposit.contractData.account.owner === broker)
    .map(deposit => ({
        key: deposit.contractId,
        value: deposit.contractId,
        text: `${deposit.contractData.asset.quantity} ${deposit.contractData.asset.id.label} | ${deposit.contractData.account.id.label}`
    }))

    const handleAcceptBrokerOrderFill = async () => {
        const key = wrapDamlTuple([props.cdata.broker, props.cdata.brokerOrderId])
        const args = { depositCid }
        await ledger.exerciseByKey(BrokerOrder.BrokerOrder_Fill, key, args);
        setDepositCid('');
    }

    const handleDepositChange = (event: React.SyntheticEvent, result: any) => {
        if (typeof result.value === 'string') {
            setDepositCid(result.value);
        }
    }

    return (
        <FormErrorHandled
            className='order-card-container'
            onSubmit={handleAcceptBrokerOrderFill}
        >
            <div className='order-card-container'>
                <Card fluid className='order-card'>
                    <div className='order-info'>
                        <div><ExchangeIcon/> {label}</div>
                        <div>{ amount }</div>
                        <div>{`@ ${price}`}</div>
                        <div>{`customer: ${customer}`}</div>
                        <div>{`id: ${props.cdata.brokerOrderId}`}</div>
                        <div>{`deposit: ${depositCid.substr(depositCid.length - 8) || ''}`}</div>
                    </div>
                    <div className='actions'>
                        <Form.Group>
                            <Form.Select
                                required
                                label='Deposit'
                                options={options}
                                onChange={handleDepositChange}
                                value={depositCid}
                            />
                            <Button
                                className='ghost'
                                content='Fill Order'
                            />
                        </Form.Group>
                    </div>
                </Card>
            </div>
        </FormErrorHandled>
    )
};

export default BrokerOrders;
