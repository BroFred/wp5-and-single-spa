import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSetRecoilState, useRecoilValue, RecoilState } from 'recoil';
import { map, omit, values, fromPairs, mapObjIndexed, pair, toPairs } from 'ramda';
import { tokenFamily, dataAtomFamily, definitionVizAtom } from './recoilStore';
import { getTokensArrayFromConfig, renderJson, loadComponent, DefinitionType } from "../utils/misc";

interface Config extends DefinitionType { 
  type:string,
  dataSources?: { [x: string]: unknown; } | { [x: number]: unknown; }
}

interface GeneratedFormPack {
  VizComp: React.FunctionComponent<{ config:Config }>,
  vizConfig: Config,
  vizName: string
}

const useImportViz:(type:string)=>React.LazyExoticComponent<React.ComponentType<any>> = (type) => useMemo(
  () => {
    return React.lazy(loadComponent('resources', `./${type}`));
  },
  [type]
);

const vizFactory:( tokenAtom:[string,RecoilState<any>][], dataAtom:[string,RecoilState<any>][] ) => React.FunctionComponent<{ config:Config }> = (tokenAtom, dataAtom) => {
  return ({ config }) => {
    const tokens = map(([k, tk]) => pair(k, useRecoilValue(tk)), tokenAtom);
    const data = fromPairs(map(([k,v])=>pair(k,useRecoilValue(v)), dataAtom));
    const Comp = useImportViz(config.type);
    const configWithToken = renderJson({
      ...config,
      ...fromPairs(tokens)
    });
    return <Suspense fallback={<div>loading.....</div>}><Comp {...data} /></Suspense>
  }
}

const generateViz:(vizConfig: Config, key:string) => GeneratedFormPack = (vizConfig, key) => {
  const relatedTokensId = getTokensArrayFromConfig(vizConfig);
  const relatedTokens = map((k) => pair(k, tokenFamily(k)), relatedTokensId);
  const { dataSources } = vizConfig;
  const dataSourceTuples = toPairs(dataSources);
  const relatedDataSources = map(([k,v]:[string, string])=>pair(k,dataAtomFamily(v)), dataSourceTuples);

  return {
    VizComp: vizFactory(relatedTokens, relatedDataSources),
    vizConfig,
    vizName: key
  }
}
const Vizs = ({ defaultViz, Layout }) => {
  const setDefinitionVizAtom = useSetRecoilState(definitionVizAtom);
  const [vizDef, setVizDef] = useState(defaultViz);

  useEffect(() => {
    setDefinitionVizAtom(vizDef);
  }, [vizDef, setDefinitionVizAtom]);
  const [vizPak, setVizComp] = useState(mapObjIndexed(generateViz, vizDef));

  const delViz = (name:string) => {
    setVizComp(omit([name], vizPak));
    setVizDef(omit([name], vizDef));
  };
  const upsertViz = (name:string, config:Config) => {
    setVizComp({
      ...vizPak,
      [name]: generateViz(config, name)
    });
    setVizDef({
      ...vizDef,
      [name]: config
    })
  };

  return (
    /* <button onClick={()=>upsertViz("table4",{
      "title": "Demo",
      "type": "viz.Line",
      "options": {
        "a": "c",
        "b": "d"
      },
      "dataSources": {
        "primary": "sample"
      }
    })}>add</button>
    <button onClick={()=>delViz("table4")}>del</button>
    <button onClick={()=>upsertViz("table4",{
      "title": "Demo",
      "type": "viz.Line",
      "options": {
        "a": "c",
        "b": "d"
      },
      "dataSources": {
        "primary": "search1"
      }
    })}>update</button> */
      <Layout>{
        map(({ VizComp: V, vizConfig, vizName }) => <V key={vizName} config={vizConfig} />, values(vizPak))
      }</Layout>
  );

}


export default Vizs;