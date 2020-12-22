import {
  useSetRecoilState,
} from 'recoil';
import {
  mapObjIndexed,
  map,
  values,
  omit,
} from 'ramda';
import React, { useState, useEffect } from 'react';
import dataSourceFactory from '../utils/dataSource';
import { DataSourceDefinition } from '../utils/dataSourceUtils';

import { dataAtomFamily, tokenFamily, definitionDataSourceAtom } from './recoilStore';


// only this component can change data and definitionDataSource atoms

interface UpsertDataSource {
  (name: string, config: DataSourceDefinition):void;
}
interface DeleteDataSource {
  (name: string):void;
}

interface  DataStore {
  Comp: React.FunctionComponent<{ ds: object }>,
  key: string,
  config: object
}

interface GenerateDataStore {
  (config:DataSourceDefinition, dataSourceName:string):JSX.Element
}

const useDataSources = (defaultDataSource:object={}):[object, UpsertDataSource, DeleteDataSource] =>{
  const [dataSources, setDataSources] = useState(defaultDataSource);
  const setDataSourceAtom = useSetRecoilState(definitionDataSourceAtom);
  useEffect(()=>setDataSourceAtom(dataSources), [ dataSources, setDataSourceAtom ]);
  const upsertDataSource:UpsertDataSource = (name, config) =>{
    setDataSources({
      ...dataSources,
      [name]: config
    });
  };
  const deleteDataSource:DeleteDataSource = (name) =>{
    setDataSources(omit([name],dataSources));
  };

  return [dataSources, upsertDataSource, deleteDataSource];
}

const generateDataStore:GenerateDataStore = (config, dataSourceName) => {
  const Comp = dataSourceFactory(dataAtomFamily(dataSourceName), tokenFamily);
  return <Comp key={dataSourceName} ds={config} />
};
const DataSources = ({defaultDataSource}) =>{
  const [dataSources, upsertDataSource, deleteDataSource] = useDataSources(defaultDataSource); 
  const [DataSourceStores, setDataSourceStores] = useState(mapObjIndexed(generateDataStore, dataSources));

  const updateDataStore:UpsertDataSource = (name, config) => {
    const DataStoreWithoutName = omit([name], DataSourceStores);
    setDataSourceStores({...DataStoreWithoutName, [name]:generateDataStore(config, name)});
    upsertDataSource(name, config);
  }
  const deleteDataStore:DeleteDataSource = (name) => {
    const DataStoreWithoutName = omit([name], DataSourceStores);
    setDataSourceStores(DataStoreWithoutName);
    deleteDataSource(name);
  }

  const addDataStore:UpsertDataSource = (name, config) => {
    const res = {...DataSourceStores, [name]:generateDataStore(config, name)}
    setDataSourceStores(res);
    upsertDataSource(name, config);
  }

  const DataSourceStoresArray = values(DataSourceStores);

  return (<>
   {DataSourceStoresArray}
   {/* {map(({key})=><Test key={key} k={key} />,DataSourceStoresArray)}

   <button onClick={()=> addDataStore(
     "search5",{
      "type": "uql",
      "query": "http://localhost:3000/posts?_page={value}",
      "a": "c",
      "b": "d"
    },
   ) }>add</button>
    <button onClick={()=> updateDataStore(
     "search1",{
      "type": "uql",
      "query": "http://localhost:3000/posts?_page={value1}",
      "a": "c",
      "b": "d"
    },
   ) }>update</button>
   <button onClick={()=> deleteDataStore(
     "search1") }>del</button> */}
  </>);
}

export default DataSources;