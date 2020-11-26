import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSetRecoilState, useRecoilState, useRecoilValue, RecoilState }from 'recoil';
import { map, omit, values, fromPairs, mapObjIndexed, pair, toPairs} from 'ramda';
import { tokenFamily, dataAtomFamily, definitionFormAtom } from './recoilStore';
import { getTokensArrayFromConfig, renderJson, loadComponent } from "../utils/misc";


interface Config { 
  type:string,
  tokens: { [x: string]: string; }
  dataSources?: { [x: string]: unknown; } | { [x: number]: unknown; }
}

interface GeneratedFormPack {
  VizComp: React.FunctionComponent<{ config:Config }>,
  vizConfig: Config,
  vizName: string
}

const useImportForm = (type:string) => useMemo(
  () => {
    return React.lazy(loadComponent('resources', `./${type}`));
  },
  [type]
);

const formFactory: ( tokenAtom:[string,RecoilState<any>][], dataAtom:[string,RecoilState<any>][] ) => React.FunctionComponent<{ config:Config }> 
= (tokenAtom, dataAtom)=>{
  return ({config})=> {
    const tokens = map(([k, tk])=>pair(k, useRecoilState(tk)), tokenAtom);
    const { type, tokens: tks } = config;
    const tokenObj = fromPairs(tokens); 
    const EditableTokenAtom = mapObjIndexed((t)=>tokenObj[t], tks);
    const data = fromPairs(map(([k,v])=>useRecoilValue(v), dataAtom));
    const Comp = useImportForm(config.type);
    const configWithToken = renderJson({
      ...config,
      ...tokenObj
    });
    return <Suspense fallback={<div>loading.....</div>}><Comp {...data} states={EditableTokenAtom}/></Suspense>
  }
}

const generateViz: (vizConfig: Config, key:string) => GeneratedFormPack= (vizConfig, key)=>{
  const relatedTokensId = values(vizConfig.tokens);
  const relatedTokens = map((k:string)=>pair(k, tokenFamily(k)), relatedTokensId);
  const { dataSources } = vizConfig;
  const dataSourceTuples = toPairs(dataSources);
  const relatedDataSources = map(([k,v]:[string, string])=>pair(k,dataAtomFamily(v)), dataSourceTuples);

  return {
    VizComp: formFactory(relatedTokens, relatedDataSources),
    vizConfig,
    vizName: key
  }
}
const Forms = ({ defaultForm, Layout }) => {
  const setDefinitionVizAtom = useSetRecoilState(definitionFormAtom);
  const [ formDef, setVizDef ] = useState(defaultForm);
  useEffect(() => {
    setDefinitionVizAtom(formDef);
  }, [formDef, setDefinitionVizAtom]);
  const [ formPak, setVizComp ] = useState(mapObjIndexed(generateViz, formDef));

  const delViz = (name:string):void=>{
    setVizComp(omit([name],formPak));
    setVizDef(omit([name],formDef));
  };
  const upsertViz = (name:string, config:Config):void=>{
    setVizComp({
      ...formPak,
      [name]: generateViz(config, name)
    });
    setVizDef({
      ...formDef,
      [name]: config
    })
  };

  return (
    <>
      {/* <button onClick={()=>upsertViz("table4",{
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
    })}>update</button> */}
      <Layout>
        {
          map(({ VizComp:V,vizConfig,vizName })=><V key={vizName} config={vizConfig}/>, values(formPak))
        }
      </Layout>
    </>
  );

}


export default Forms;