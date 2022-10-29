import { PropsWithChildren, useEffect, useState } from "react";
import styles from './custom.module.css'

export default function JitterText({ words }: {words: string[]}) {
  const [str, setStr] = useState(words.join(' '))
  useEffect(() => {
    const interval1 = setInterval(() => {
      const newWords = [...words].sort(() => Math.random() * 2 - 1)
      setStr(newWords.join(' '))
    }, 2750)
    const interval2 = setInterval(() => {
      const newWords = [...words].sort(() => Math.random() * 2 - 1)
      setStr(newWords.join(' '))
    }, 4100)
    const interval3 = setInterval(() => {
      setStr(words.join(' '))
    }, 1200)
    return () => { clearInterval(interval1); clearInterval(interval2); clearInterval(interval3) }
  }, [words])
  return (
    <div className="inline relative">
      <span className="blur-[0.05rem] whitespace-nowrap">{str}</span>
      <span className={`absolute left-0 -top-1 whitespace-nowrap scale-x-110 opacity-20 ${styles.jitter}`}>{str}</span>
      <span className="blur-[0.1rem] absolute left-0 -top-1 whitespace-nowrap scale-y-[2] opacity-20">{str}</span>
      <span className="absolute left-0 -top-1 whitespace-nowrap scale-y-150 scale-x-110 opacity-10">{str}</span>
    </div>
  )
}

// workaround for next to not consider this as a page
export const getStaticProps = async () => {
  return { notFound: true }
}