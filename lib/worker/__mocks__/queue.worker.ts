export const onmessage = jest.fn();
export const postMessage = jest.fn((d) => {
  onmessage({ data: d });
});

export const start = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    onmessage,
    postMessage,
  };
});

export default mock;
