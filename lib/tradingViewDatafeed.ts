const API = 'http://localhost:5000/api/market';

export const datafeed = {
  onReady(cb: any) {
    setTimeout(() => {
      cb({
        supported_resolutions: ['1', '5', '10', '15', '30', '60'],
      });
    }, 0);
  },

  resolveSymbol(symbolName: string, onResolve: any) {
    onResolve({
      name: symbolName,
      ticker: symbolName,
      type: 'index',
      session: '24x7',
      timezone: 'Asia/Kolkata',
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      supported_resolutions: ['1', '5', '10', '15', '30', '60'],
      volume_precision: 2,
      data_status: 'streaming',
    });
  },

  getBars(
    symbolInfo: any,
    resolution: string,
    periodParams: any,
    onResult: any
  ) {
    fetch(
      `${API}/candle?symbol=${symbolInfo.name}&resolution=${resolution}`
    )
      .then(res => res.json())
      .then(bar => {
        onResult([bar], { noData: false });
      });
  },

  subscribeBars(
    symbolInfo: any,
    resolution: string,
    onRealtime: any,
    uid: string
  ) {
    const interval = setInterval(async () => {
      const res = await fetch(
        `${API}/candle?symbol=${symbolInfo.name}&resolution=${resolution}`
      );
      const bar = await res.json();
      onRealtime(bar);
    }, 1000);

    (window as any)[uid] = interval;
  },

  unsubscribeBars(uid: string) {
    clearInterval((window as any)[uid]);
    delete (window as any)[uid];
  },
};
