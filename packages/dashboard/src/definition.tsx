import React from 'react';
// import ReactDOM from 'react-dom';
// import singleSpaReact from 'single-spa-react';
import styled from 'styled-components';
import Fromlayout from './layout/FormLayout';
import getVizGirdLayout from './layout/VizGridLayout';
import definition from './sampleDefinition.json';

import DataSource from "./definitionComponents/DataSource";
import Token from "./definitionComponents/Token";
import Viz from "./definitionComponents/Visualization";
import Forms from "./definitionComponents/Forms";

const DashboardContainer = styled.div`
  margin: 10px;
`;

/*
    1.token
    2.viz (can't change individually)
    3.layout (can't change individually)
    4.dataSource

    reation chain: 
    defintion change --> all change
    token change --> everything token related changes
    dataSource change --> viz change 
*/


interface Definition {
  dataSources: object;
  visualizations: object;
  forms?: object;
  tokens?: object;
  layout: object;
}

const DashboardCore = ( def: Definition ) => {
  const { forms, visualizations: viz , tokens, dataSources: dataSource, layout } = def;
  return () => {
    return (
      <DashboardContainer>
        <Forms defaultForm={forms} Layout={ Fromlayout } />
        <DataSource defaultDataSource={dataSource} />
        <Token defaultToken = {tokens}/>
        <Viz defaultViz={viz} Layout={ getVizGirdLayout(layout) } />
      </DashboardContainer>
    );
  };
};

export default DashboardCore(definition);

// const footerLifecycles = singleSpaReact({
//     React,
//     ReactDOM,
//     rootComponent: DashboardCore(definition)
//   });

//   export const bootstrap = footerLifecycles.bootstrap;
//   export const mount = footerLifecycles.mount;
//   export const unmount = footerLifecycles.unmount;
