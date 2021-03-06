/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Col, Divider, Row } from 'antd';
import { ContractFunction } from 'ethers';
import { FunctionFragment } from 'ethers/lib/utils';
import React, { FC, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Dispatch } from 'react';
import { tryToDisplay } from './displayUtils';

interface IDisplayVariableProps {
  contractFunction: ContractFunction | undefined;
  functionInfo: FunctionFragment;
  refreshRequired: boolean;
  setTriggerRefresh: Dispatch<SetStateAction<boolean>>;
}

export const DisplayVariable: FC<IDisplayVariableProps> = (props) => {
  const [variable, setVariable] = useState('');

  const refresh = useCallback(async () => {
    try {
      if (props.contractFunction) {
        const funcResponse = await props.contractFunction();
        setVariable(funcResponse);
        props.setTriggerRefresh(false);
      }
    } catch (e) {
      console.log(e);
    }
  }, [setVariable, props.contractFunction, props.setTriggerRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh, props.refreshRequired, props.contractFunction]);

  return (
    <div>
      <Row>
        <Col
          span={8}
          style={{
            textAlign: 'right',
            opacity: 0.333,
            paddingRight: 6,
            fontSize: 24,
          }}>
          {props.functionInfo.name}
        </Col>
        <Col span={14}>
          <h2>{tryToDisplay(variable)}</h2>
        </Col>
        <Col span={2}>
          <h2>
            <a href="#" onClick={refresh}>
              🔄
            </a>
          </h2>
        </Col>
      </Row>
      <Divider />
    </div>
  );
};

export default DisplayVariable;
