if (process.env.REACT_APP_API_ENV === 'vconsole' || process.env.REACT_APP_API_ENV === 'local') {
  import('vconsole').then((VConsole) => {
    new VConsole.default();
  });
}
console.log(process.env.REACT_APP_API_ENV, '===process.env.MOBILE_CONSOLE');
