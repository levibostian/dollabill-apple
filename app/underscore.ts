const _ = {
  array: {
    contains<T>(array: T[], doesContain: (element: T) => boolean): boolean {
      let result = false

      array.forEach((element) => {
        if (doesContain(element)) {
          result = true
        }
      })

      return result
    }
  },
  date: {
    /**
     * Sort date array in order: [older date, newer date].
     *
     * Use:
     * ```
     * const dates: Date[] = []
     * dates.sort(_.date.sortOldToNew)
     *
     * const nestedDates: {date: Date}[] = []
     * nestedDates.sort((first, second) => _.date.sortOldToNew(first.date, second.date))
     * ```
     */
    sortOldToNew(first: Date, second: Date): number {
      return first.getTime() - second.getTime()
    },
    /**
     * Sort date array in order: [newer date, older date].
     *
     * Use:
     * ```
     * const dates: Date[] = []
     * dates.sort(_.date.sortNewToOld)
     *
     * const nestedDates: {date: Date}[] = []
     * nestedDates.sort((first, second) => _.date.sortNewToOld(first.date, second.date))
     * ```
     */
    sortNewToOld(first: Date, second: Date): number {
      return second.getTime() - first.getTime()
    }
  }
}

/**
 * @internal 
 */
export default _
