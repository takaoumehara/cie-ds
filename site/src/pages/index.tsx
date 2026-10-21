import type { Route } from "../nav"
import { PrevNext } from "../prevnext"
import { CategoryPage, ComponentPage, LibraryPage, Missing } from "./component"
import { FoundationPage } from "./foundations"
import { FilePage, PatternPage } from "./kit"
import { Overview, PagesPage, Setup } from "./overview"

export function Page({ route }: { route: Route }) {
  return (
    <>
      {route.page === "overview" && <Overview />}
      {route.page === "setup" && <Setup />}
      {route.page === "pages" && <PagesPage />}
      {route.page === "foundation" && <FoundationPage id={route.id} />}
      {route.page === "category" && <CategoryPage id={route.id} />}
      {route.page === "component" && <ComponentPage name={route.name} />}
      {route.page === "library" && <LibraryPage name={route.name} />}
      {route.page === "pattern" && <PatternPage id={route.id} />}
      {route.page === "file" && <FilePage file={route.file} />}
      {route.page === "missing" && <Missing what={route.path} />}
      <PrevNext route={route} />
    </>
  )
}
