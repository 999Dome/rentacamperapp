import "bootstrap/dist/css/bootstrap.min.css";

import { MainHeader } from "./components/mainheader.tsx";
import { Hero } from "./components/home/hero.tsx";
import { SearchBar } from "./components/home/searchBar.tsx";
import { Highlights } from "./components/home/highlights.tsx";
import { Contact } from "./components/home/contact.tsx";
import { MainFooter } from "./components/mainfooter.tsx";

document.body.appendChild(MainHeader());
document.body.appendChild(Hero());
document.body.appendChild(SearchBar());
document.body.appendChild(Highlights());
document.body.appendChild(Contact());
document.body.appendChild(MainFooter());
