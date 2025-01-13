import { useEffect } from 'react'
import { HOUR_WIDTH, START_HOUR } from '../utils/utils'

export const useScrollToEarliest = (dependencies = []) => {
    useEffect(() => {
        const scrollToEarliestShowing = () => {
            const container = document.querySelector('.overflow-y-auto')
            if (!container) return

            const showings = container.querySelectorAll('button.absolute.flex.h-24')
            if (!showings.length) return

            let earliestLeft = Infinity
            showings.forEach(showing => {
                const left = parseInt(showing.style.left)
                if (left < earliestLeft) {
                    earliestLeft = left
                }
            })

            if (earliestLeft !== Infinity) {
                const hourOfShow = Math.floor(earliestLeft / HOUR_WIDTH) + START_HOUR
                const scrollPosition = (hourOfShow - START_HOUR) * HOUR_WIDTH
                container.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                })
            }
        }

        setTimeout(scrollToEarliestShowing, 100)
    }, dependencies)
}