import React from 'react';
import { withRouter, RouteComponentProps, NavLink } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { IconButton } from '@material-ui/core';
import { KeyboardArrowRight } from '@material-ui/icons';
import { useStreamQueries } from '../../Main';
import { getName } from '../../config';
import { Issuance } from '@daml.js/da-marketplace/lib/Marketplace/Issuance/Model';
import Tile from '../../components/Tile/Tile';
import StripedTable from '../../components/Table/StripedTable';

export const IssuancesTable: React.FC = () => {
  const { contracts: issuances, loading: issuancesLoading } = useStreamQueries(Issuance);
  return (
    <StripedTable
      headings={[
        'Issuing Agent',
        'Issuer',
        'Issuance ID',
        'Issuance Account',
        'Asset',
        'Quantity',
        'Details',
      ]}
      loading={issuancesLoading}
      rows={issuances.map(c => [
        getName(c.payload.provider),
        getName(c.payload.customer),
        c.payload.issuanceId,
        c.payload.accountId.label,
        c.payload.assetId.label,
        c.payload.quantity,
        <NavLink to={`/app/issuance/issuances/${c.contractId.replace('#', '_')}`}>
          <IconButton color="primary" size="small" component="span">
            <KeyboardArrowRight fontSize="small" />
          </IconButton>
        </NavLink>,
      ])}
    />
  );
};

const IssuancesComponent: React.FC<RouteComponentProps> = ({ history }: RouteComponentProps) => {
  return (
    <div className="issuances">
      <Tile header={<h4>Actions</h4>}>
        <Button secondary className="ghost" onClick={() => history.push('/app/issuance/new')}>
          New Issuance
        </Button>
      </Tile>

      <Tile header={<h4>Issuances</h4>}>
        <IssuancesTable />
      </Tile>
    </div>
  );
};

export const Issuances = withRouter(IssuancesComponent);
