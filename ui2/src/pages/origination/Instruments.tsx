import React from 'react';
import { withRouter, RouteComponentProps, NavLink } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import { KeyboardArrowRight } from '@material-ui/icons';
import { useStreamQueries } from '../../Main';
import { getName } from '../../config';
import { AssetDescription } from '@daml.js/da-marketplace/lib/Marketplace/Issuance/AssetDescription';
import StripedTable from '../../components/Table/StripedTable';
import { Button } from 'semantic-ui-react';
import Tile from '../../components/Tile/Tile';

export const InstrumentsTable: React.FC = () => {
  const { contracts: allInstruments, loading: allInstrumentsLoading } = useStreamQueries(
    AssetDescription
  );
  const instruments = allInstruments.filter(c => c.payload.assetId.version === '0');

  return (
    <StripedTable
      headings={['Issuer', 'Signatories', 'Id', 'Version', 'Description', 'Details']}
      loading={allInstrumentsLoading}
      rows={instruments.map(c => [
        getName(c.payload.issuer),
        Object.keys(c.payload.assetId.signatories.textMap).join(', '),
        c.payload.assetId.label,
        c.payload.assetId.version,
        c.payload.description,
        <NavLink to={`/app/manage/instrument/${c.contractId.replace('#', '_')}`}>
          <IconButton color="primary" size="small" component="span">
            <KeyboardArrowRight fontSize="small" />
          </IconButton>
        </NavLink>,
      ])}
    />
  );
};

const InstrumentsComponent: React.FC<RouteComponentProps> = ({ history }: RouteComponentProps) => {
  return (
    <div className="instruments">
      <Tile header={<h4>Actions</h4>}>
        <Button secondary className="ghost" onClick={() => history.push('/app/instrument/new')}>
          New Instrument
        </Button>
      </Tile>

      <InstrumentsTable />
    </div>
  );
};

export const Instruments = withRouter(InstrumentsComponent);
