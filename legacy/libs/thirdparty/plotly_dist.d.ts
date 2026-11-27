// plotly.js no publica tipos para sus bundles de `dist/`
declare module "plotly.js/dist/plotly.js" {
  const Plotly: object;
  export default Plotly;
}
