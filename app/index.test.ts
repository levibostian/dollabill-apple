import { hello } from "."

describe(`hello`, () => {
  it(`given text expect result`, () => {
    expect(hello("world")).toEqual("hello world")
  })
})
