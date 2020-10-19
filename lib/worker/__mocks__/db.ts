export const add = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    queue: {
      add,
    },
  };
});

export default mock;
