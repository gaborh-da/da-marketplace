import React, { useEffect, useRef, useState } from "react";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { render } from "../../components/Claims/render";
import { transformClaim } from "../../components/Claims/util";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AssetDescription } from "@daml.js/da-marketplace/lib/Marketplace/Issuance/AssetDescription";
import { RequestCreateListing, Service } from "@daml.js/da-marketplace/lib/Marketplace/Listing/Service";
import { publicParty } from "../../config";
import {ServicePageProps} from "../common";
import {Button, Form, Header, Icon} from "semantic-ui-react";
import FormErrorHandled from "../../components/Form/FormErrorHandled";
import {IconClose} from "../../icons/icons";
import Tile from "../../components/Tile/Tile";

const NewComponent : React.FC<RouteComponentProps & ServicePageProps<Service>> = ({ history, services }) => {
  const el1 = useRef<HTMLDivElement>(null);
  const el2 = useRef<HTMLDivElement>(null);

  const [ showTradedAsset, setShowTradedAsset ] = useState(false);
  const [ showQuotedAsset, setShowQuotedAsset ] = useState(false);

  const [ tradedAssetLabel, setTradedAssetLabel ] = useState("");
  const [ tradedAssetPrecision, setTradedAssetPrecision ] = useState("");
  const [ quotedAssetLabel, setQuotedAssetLabel ] = useState("");
  const [ quotedAssetPrecision, setQuotedAssetPrecision ] = useState("");
  const [ minimumTradableQuantity, setMinimumTradableQuantity ] = useState("");
  const [ maximumTradableQuantity, setMaximumTradableQuantity ] = useState("");
  const [ listingId, setListingId ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ calendarId, ] = useState("1261007448");

  const ledger = useLedger();
  const party = useParty();
  const customerServices = services.filter(s => s.payload.customer === party);
  const allAssets = useStreamQueries(AssetDescription).contracts;
  const assets = allAssets.filter(c => c.payload.assetId.version === "0");
  const tradedAsset = assets.find(c => c.payload.assetId.label === tradedAssetLabel);
  const quotedAsset = assets.find(c => c.payload.assetId.label === quotedAssetLabel);

  const canRequest =
    !!tradedAssetLabel && !!tradedAsset && !!tradedAssetPrecision &&
    !!quotedAssetLabel && !!quotedAsset && !!quotedAssetPrecision &&
    !!minimumTradableQuantity && !!maximumTradableQuantity && !!listingId && !!calendarId;

  useEffect(() => {
    if (!el1.current || !tradedAsset) return;
    el1.current.innerHTML = "";
    const data = transformClaim(tradedAsset.payload.claims, "root");
    render(el1.current, data);
  }, [el1, tradedAsset, showTradedAsset]);

  useEffect(() => {
    if (!el2.current || !quotedAsset) return;
    el2.current.innerHTML = "";
    const data = transformClaim(quotedAsset.payload.claims, "root");
    render(el2.current, data);
  }, [el2, quotedAsset, showQuotedAsset]);

  const service = customerServices[0];
  if (!service) return (<></>);

  const requestListing = async () => {
    if (!tradedAsset || !quotedAsset) return;
    const request : RequestCreateListing = {
      listingId,
      calendarId,
      description,
      tradedAssetId: tradedAsset.payload.assetId,
      quotedAssetId: quotedAsset.payload.assetId,
      tradedAssetPrecision,
      quotedAssetPrecision,
      minimumTradableQuantity,
      maximumTradableQuantity,
      observers : [ publicParty ]
    };
    await ledger.exercise(Service.RequestCreateListing, service.contractId, request);
    history.push("/app/listing/requests");
  }

  return (
    <div className='listing'>
      <div className='new-listing'>
        <Header as='h2'>New Listing</Header>
        <FormErrorHandled onSubmit={() => requestListing()} >
          <div className='form-select'>
            <Form.Select
              className='select'
              label='Traded Asset'
              placeholder='Select...'
              required
              options={ assets.filter(c => c.payload.assetId.label !== quotedAssetLabel).map(c => ({ key: c, text: c.payload.assetId.label, value: c.payload.assetId.label })) }
              onChange={(_, change) => setTradedAssetLabel(change.value as string)}
            />
            { showTradedAsset ?
              <Icon name='eye slash' link onClick={() => setShowTradedAsset(false)} /> :
              <Icon name='eye' link onClick={() => setShowTradedAsset(true)} />
            }
          </div>
          <Form.Input
            label='Traded Asset Precision'
            type='number'
            required
            onChange={(_, change) => setTradedAssetPrecision(change.value as string)}
          />
          <div className='form-select'>
            <Form.Select
              className='select'
              label='Quoted Asset'
              placeholder='Select...'
              required
              options={ assets.filter(c => c.payload.assetId.label !== tradedAssetLabel).map(c => ({ key: c, text: c.payload.assetId.label, value: c.payload.assetId.label })) }
              onChange={(_, change) => setQuotedAssetLabel(change.value as string)}
            />
            { showQuotedAsset ?
              <Icon name='eye slash' link onClick={() => setShowQuotedAsset(false)} /> :
              <Icon name='eye' link onClick={() => setShowQuotedAsset(true)} />
            }
          </div>
          <Form.Input
            label='Quoted Asset Precision'
            type='number'
            required
            onChange={(_, change) => setQuotedAssetPrecision(change.value as string)}
          />
          <Form.Input
            label='Minimum Tradable Quantity'
            type='number'
            required
            onChange={(_, change) => setMinimumTradableQuantity(change.value as string)}
          />
          <Form.Input
            label='Maximum Tradable Quantity'
            type='number'
            required
            onChange={(_, change) => setMaximumTradableQuantity(change.value as string)}
          />
          <Form.Input
            label='Symbol'
            required
            onChange={(_, change) => setListingId(change.value as string)}
          />
          <Form.Input
            label='Description'
            required
            onChange={(_, change) => setDescription(change.value as string)}
          />
          <Form.Input
            label='Trading Calendar ID'
            required
            readOnly
            placeholder={calendarId}
          />
          <div className='submit'>
            <Button
              type='submit'
              className='ghost'
              disabled={!canRequest}
              content='Submit'/>
            <a className='a2' onClick={() => history.goBack()}><IconClose/> Cancel</a>
          </div>
        </FormErrorHandled>
      </div>
      <div className='asset'>
        {showTradedAsset && (
          <Tile header={<h2>Auctioned Asset</h2>}>
            <div ref={el1} style={{ height: "100%" }}/>
          </Tile>
        )}
        {showQuotedAsset && (
          <Tile header={<h2>Quoted Asset</h2>}>
            <div ref={el2} style={{ height: "100%" }}/>
          </Tile>
        )}
      </div>
    </div>
  );
};

export const New = withRouter(NewComponent);