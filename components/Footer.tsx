export default function Footer({ published, author }: { published: number, author: string }) {
  return <span className="mt-8 block text-gray-700 dark:text-gray-300 italic include-in-screenshot">
    — {author}
    <span className="text-gray-400 ml-3 ">{new Date(published).toLocaleDateString()}</span>
  </span>
}
