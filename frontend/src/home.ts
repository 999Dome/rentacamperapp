/**
 * Bootstrap entry point for the home page: mounts the header, hero banner,
 * search bar, highlights, workflow explainer, contact section, and footer
 * directly into `document.body`, in order.
 */
import "bootstrap/dist/css/bootstrap.min.css";

import { MainHeader } from "./components/mainheader.tsx";
import { Hero } from "./components/home/hero.tsx";
import { SearchBar } from "./components/home/searchBar.tsx";
import { Highlights } from "./components/home/highlights.tsx";
import { Workflow } from "./components/home/workflow.tsx";
import { Contact } from "./components/home/contact.tsx";
import { MainFooter } from "./components/mainfooter.tsx";

document.body.appendChild(MainHeader());
document.body.appendChild(Hero());
document.body.appendChild(SearchBar());
document.body.appendChild(Highlights());
document.body.appendChild(Workflow())
document.body.appendChild(Contact());
document.body.appendChild(MainFooter());

