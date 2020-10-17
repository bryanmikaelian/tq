export const onmessage = jest.fn();
export const postMessage = jest.fn((d) => {
  onmessage({ data: d });
});

const mock = jest.fn().mockImplementation(() => {
  return {
    onmessage,
    postMessage,
  };
});

export default mock;
