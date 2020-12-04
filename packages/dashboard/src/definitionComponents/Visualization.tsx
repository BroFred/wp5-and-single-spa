import React, { useEffect, useReducer, Suspense } from 'react';
import { useSetRecoilState, useRecoilValue, RecoilState } from 'recoil';
import { map, omit, values, fromPairs, mapObjIndexed, pair } from 'ramda';
import { tokenFamily, dataAtomFamily, definitionVizAtom } from './recoilStore';
import { getTokensArrayFromConfig, renderJson, generator, VizConfig, useImportResources } from "../utils/misc";


const vizFactory:( tokenAtom:[string,RecoilState<any>][], dataAtom:[string,RecoilState<any>][] ) => React.FunctionComponent<{ config:VizConfig, dispatch:React.Dispatch<any>, name:string }> = (tokenAtom, dataAtom) => {
  return ({ config, dispatch, name }) => {
    const tokens = map(([k, tk]) => pair(k, useRecoilValue(tk)), tokenAtom);
    const data = fromPairs(map(([k,v])=>pair(k,useRecoilValue(v)), dataAtom));
    const Comp = useImportResources(config.type);
    const configWithToken = renderJson({
      ...config,
      ...fromPairs(tokens)
    });
    return (
    <Suspense fallback={<div>loading.....</div>}>
      <Comp {...data} config={configWithToken} dispatch={dispatch} name={name}/>
    </Suspense>
    );
  }
}

const generateViz = (config: VizConfig, key:string, dispatch ):JSX.Element => {
  const relatedTokensId = getTokensArrayFromConfig(config);
  const  { Comp: V, config:c, name } = generator(vizFactory, tokenFamily, dataAtomFamily)(config, key, relatedTokensId);
  return <V key={name} config={c} dispatch={dispatch} name={name}/>
}

const Vizs = ({ defaultViz, Layout }) => {
  const setDefinitionVizAtom = useSetRecoilState(definitionVizAtom);
  const reducer = (state, action) => {
     switch (action.type) {
      case 'init': 
        return {
          vizPak: action.vizPak,
          dispatchFn: action.dispatchFn
        }
      case 'del':
        return {
          vizPak: omit([action.name], state.vizPak),
          vizDef: omit([action.name], state.vizDef)
        };
      case 'upsert':
        return {
          vizPak: {
              ...state.vizPak,
              [action.name]: generateViz(action.config, action.name, state.dispatchFn)
            },
          vizDef:{
                ...state.vizDef,
                [action.name]: action.config
              }
        };
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    vizPak:{},
    vizDef: defaultViz,
    dispatchFn: ()=>{}
  });

  useEffect(()=>{
    dispatch({
      type:"init",
      vizPak: mapObjIndexed((v,key)=>generateViz(v, key, dispatch), state.vizDef),
      dispatchFn: dispatch
    })
  },[])
  useEffect(() => {
    setDefinitionVizAtom(state.vizDef);  
  }, [state.vizDef, setDefinitionVizAtom]);


  return (
        <Layout>{
        values(state.vizPak)
        }
        </Layout>
  );

}


export default Vizs;