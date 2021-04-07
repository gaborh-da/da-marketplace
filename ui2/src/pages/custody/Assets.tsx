import React, { useMemo } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { IconButton } from "@material-ui/core";
import { useParty, useStreamQueries } from "@daml/react";
import { AssetDeposit } from "@daml.js/da-marketplace/lib/DA/Finance/Asset";
import { AssetSettlementRule } from "@daml.js/da-marketplace/lib/DA/Finance/Asset/Settlement";
import { getName } from "../../config";
import { KeyboardArrowRight } from "@material-ui/icons";
import { Service } from "@daml.js/da-marketplace/lib/Marketplace/Custody/Service";
import { ServicePageProps } from "../common";
import { Button, Header } from "semantic-ui-react";
import Tile from "../../components/Tile/Tile";
import StripedTable from "../../components/Table/StripedTable";

const AssetsComponent: React.FC<RouteComponentProps & ServicePageProps<Service>> = ({ history, services }: RouteComponentProps & ServicePageProps<Service>) => {
  const party = useParty();

  const accounts = useStreamQueries(AssetSettlementRule).contracts;
  const deposits = useStreamQueries(AssetDeposit).contracts;

  const tradeableDeposits = useMemo(() =>
    deposits.filter(d => accounts.findIndex(s => s.payload.account.id.label === d.payload.account.id.label) !== -1)
    , [deposits, accounts, party]);

  return (
    <div className='assets'>
      <Tile header={<h2>Actions</h2>}>
        <Button
          className='ghost'
          onClick={() => history.push("/app/custody/accounts/new")}>New Account</Button>
      </Tile>
      <Header as='h2'>Holdings</Header>
      <StripedTable
        headings={[
          'Asset',
          'Account',
          'Owner',
          'Details'
        ]}
        rows={
          tradeableDeposits.map(c => [
            <><b>{c.payload.asset.id.label}</b> {c.payload.asset.quantity}</>,
            c.payload.account.id.label,
            getName(c.payload.account.owner),
            <IconButton color="primary" size="small" component="span" onClick={() => history.push("/app/custody/account/" + accounts.find(a => a.payload.account.id.label === c.payload.account.id.label)?.contractId.replace("#", "_"))}>
              <KeyboardArrowRight fontSize="small" />
            </IconButton>
          ])
        }
      />
      <Header as='h2'>Accounts</Header>
      <StripedTable
        headings={[
          'Account',
          'Provider',
          'Owner',
          'Role',
          'Controllers',
          // 'Requests',
          'Details'
        ]}
        rows={
          accounts.map(c => [
            c.payload.account.id.label,
            getName(c.payload.account.provider),
            getName(c.payload.account.owner),
            party === c.payload.account.provider ? "Provider" : "Client",
            Object.keys(c.payload.ctrls.textMap).join(", "),
            <IconButton color="primary" size="small" component="span" onClick={() => history.push("/app/custody/account/" + c.contractId.replace("#", "_"))}>
              <KeyboardArrowRight fontSize="small" />
            </IconButton>
          ])
        } />
    </div>
  );
};

export const Assets = withRouter(AssetsComponent);