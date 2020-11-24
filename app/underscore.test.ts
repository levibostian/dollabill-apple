import _ from "./underscore"

describe("array", () => {
  describe("contains", () => {
    it(`given empty array, expect false`, async () => {
      const given: string[] = []

      const actual = _.array.contains(given, (item) => item === "foo")

      expect(actual).toEqual(false)
    })
    it(`given array without item, expect false`, async () => {
      const given: string[] = ["bar"]

      const actual = _.array.contains(given, (item) => item === "foo")

      expect(actual).toEqual(false)
    })
    it(`given array with item, expect true`, async () => {
      const given: string[] = ["bar", "foo"]

      const actual = _.array.contains(given, (item) => item === "foo")

      expect(actual).toEqual(true)
    })
  })
})

describe("date", () => {
  describe("sortOldToNew", () => {
    it(`given empty array, expect empty array`, async () => {
      const given: Date[] = []

      given.sort(_.date.sortOldToNew)

      expect(given).toEqual([])
    })
    it(`given items already in order, expect unchanged`, async () => {
      const given: Date[] = [new Date('2018-04-04T16:00:00.000Z'), new Date('2020-04-04T16:00:00.000Z')]
      const expected = given 

      given.sort(_.date.sortOldToNew)

      expect(given).toEqual(expected)
    })
    it(`given items not in order, expect to sort`, async () => {
      const given: Date[] = [new Date('2020-04-04T16:00:00.000Z'), new Date('2018-04-04T16:00:00.000Z')]
      const expected = [given[1], given[0]]

      given.sort(_.date.sortOldToNew)

      expect(given).toEqual(expected)
    })
    it(`given identical dates, expect unchanged`, async () => {
      const given: Date[] = [new Date('2018-04-04T16:00:00.000Z'), new Date('2018-04-04T16:00:00.000Z')]
      const expected = given 

      given.sort(_.date.sortOldToNew)

      expect(given).toEqual(expected)
    })
  })
  describe("sortNewToOld", () => {
    it(`given empty array, expect empty array`, async () => {
      const given: Date[] = []

      given.sort(_.date.sortNewToOld)

      expect(given).toEqual([])
    })
    it(`given items already in order, expect unchanged`, async () => {
      const given: Date[] = [new Date('2020-04-04T16:00:00.000Z'), new Date('2018-04-04T16:00:00.000Z')]
      const expected = given 

      given.sort(_.date.sortNewToOld)

      expect(given).toEqual(expected)
    })
    it(`given items not in order, expect to sort`, async () => {
      const given: Date[] = [new Date('2018-04-04T16:00:00.000Z'), new Date('2020-04-04T16:00:00.000Z')]
      const expected = [given[1], given[0]]

      given.sort(_.date.sortNewToOld)

      expect(given).toEqual(expected)
    })
    it(`given identical dates, expect unchanged`, async () => {
      const given: Date[] = [new Date('2018-04-04T16:00:00.000Z'), new Date('2018-04-04T16:00:00.000Z')]
      const expected = given 

      given.sort(_.date.sortNewToOld)

      expect(given).toEqual(expected)
    })
  })
})