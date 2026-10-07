# anikapopat — portfolio

Plain HTML/CSS/JS with no build step. To preview it, open `index.html` in a browser.

```
index.html        Home: name, focus areas, positioning statement, selected work
work.html         Filterable case-study grid
about.html        Opening statement, portrait, bio, skills, education
contact.html      Email, LinkedIn, resume
case-study.html   Template for one project; copy once per case study
css/styles.css    All styles (colors and fonts are in :root at the top)
js/main.js        Menu, Boston clock, filters, copy-email, fit-to-width name
assets/           Your resume, photo and images go here (see assets/README.txt)
```

## Swapping in your content

Every placeholder has a `data-placeholder` attribute. While `<html>` has
`data-show-placeholders`, those spots get a blue dashed outline, so you can't
publish sample copy or stats by accident. Search the project for
`data-placeholder` and `EDIT:` to find them.

1. **Case studies:** in `work.html`, follow the comment block above the grid.
   Mirror your top three in the "Selected work" list in `index.html`.
2. **Case study pages:** copy `case-study.html` to something like
   `work-creator-seeding.html`, fill it in, and update the card's `href`.
3. **Photo:** add `assets/anika-portrait.jpg`, then see the comment in `about.html`.
4. **Resume:** add `assets/Anika-Popat-Resume.pdf`. The links already point there.
5. **Email and LinkedIn:** update them in `contact.html`. Replace
   `YOUR-HANDLE` in the menu footer on every page with a find-and-replace.
6. **Copy:** update the hero statement and availability line (`index.html`),
   and the opening statement, bio and skills (`about.html`).
7. **Finally:** remove `data-show-placeholders` from the `<html>` tag on
   every page.

## Changing the look

- Accent color: `--accent` in `css/styles.css`.
- Fonts: Newsreader (serif) and Instrument Sans, both from Google Fonts.
  The `<link>` is in each page's `<head>`, and the names are in `--serif` / `--sans`.
- Portrait is black & white. Delete the `filter` in `.portrait img` for color.

## Deploying

- **Netlify:** drag the folder onto app.netlify.com/drop.
- **GitHub Pages:** push to a repo, then Settings → Pages → deploy from the main branch.

Delete the `inspiration*.png` files before you upload. Nothing uses them, and
they add about 4 MB to the upload.
