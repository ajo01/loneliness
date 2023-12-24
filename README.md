# Loneliness - A Story

The feeling of loneliness can sometimes feel inescapable. In many, it can become chronic
and even lead to depression. In others, it can spur a need to take action and go out more.
Why do we feel lonely? And what factors contribute to it? What can we discover about
loneliness and its patterns?
These are the questions that led us to explore the topic of loneliness for our project. For
our project, we wanted to focus on the everyday impacts and factors that contribute to
loneliness.
We wanted to take a data-driven story approach to talk about the issue of loneliness and
its factors and see correlations and interesting patterns for ourselves and others alike.

## How to run

This a React app. You can run it 2 ways.

1. React Server

   `npm i` then `npm start`

   This should open the app at http://localhost:3000/

2. Static Server

   `npm run build`

   `cd build`

   `npx http-server`

   This should open the app at http://127.0.0.1:8080/

3. Static Server - no NPM

We attached the build folder for those without npm installed. In this case you just need to run two commands.

`cd build`

`npx http-server`

This should open the app at http://127.0.0.1:8080/

## How to run the preprocessing script

`cd preprocessing`

`jupyter notebook`

go to localhost:8888

select on script.ipynb

select Cell > Run All

## ✍️ Citations:

Arrows

- https://codepen.io/JoshMac/pen/MaYEmJ
- https://codepen.io/jmuspratt/pen/zYddQQ

Indicators

- https://codepen.io/Fernos/pen/vazgzj
- also check CitationREADME.md as it cites the use of chatgpt with exact prompts and output

Linear Gradient

- https://d3-graph-gallery.com/graph/line_color_gradient_svg.html
- https://gist.github.com/anbnyc/0121e8c412ebb173a4b9859c51c22ee2

Make dashed lines

- https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray

Sort by object string property

- https://stackoverflow.com/questions/45924821/javascript-sorting-array-of-objects-by-string-property

Gradient texts

- https://cssgradient.io/blog/css-gradient-text/

Dynamic tooltip text

- https://www.students.cs.ubc.ca/~cs-436v/20Jan/fame/projects/20jan/fb-politics/index.html

Stacked Bar Chart

- Didn't use yet, but this looks useful: https://stackoverflow.com/questions/66840038/is-there-a-way-to-convert-a-d3-rollup-created-with-two-keys-to-a-flat-array-of-o
- https://observablehq.com/@ericd9799/learning-stacked-bar-chart-in-d3-js
- https://www.educative.io/answers/how-to-create-stacked-bar-chart-using-d3
- https://d3-graph-gallery.com/graph/barplot_stacked_percent.html

Understanding Keys for Stacked Bar

- https://www.geeksforgeeks.org/d3-js-d3-keys-function/

- deleted "total" rows, as they were redundant and could be calculated using d3.rollups already (except for total of all loneliness levels)
  use custom svgs as points
  https://netwoven.com/custom-development/different-ways-adding-custom-svg-images-d3-line-charts-angular-4/

Adding Emojis to the Bar Chart

- https://stackoverflow.com/questions/53122344/add-image-at-top-of-each-d3-bar-rect
- https://www.fabiofranchino.com/blog/how-to-load-image-in-svg-with-d3js/
- https://copyprogramming.com/howto/adding-image-in-d3-js

Dot chart

- https://observablehq.com/@datavizcowboy/stacked-dots

Sankey chart

- https://d3-graph-gallery.com/sankey.html
- https://github.com/d3/d3-sankey
- https://observablehq.com/@d3/sankey-component

Typewriter Effect

- https://www.npmjs.com/package/typewriter-effect

## 📊 Data Pre-processing:

Dataset #1 (StatCan) 9:22

- changed "-1" values in "amount" column to be 0, as to not skew results when summing
- got rid of all "total persons" data
- created a "categories" column that differentiates each datum by its "type", these are the categories:
  - **age**: [ 15 to 24 years, 25 to 34 years, 35 to 44 years, 45 to 54 years, 55 to 64 years, 65+ years, and more overlapping categories ]
  - **gender (2)**: [ male, female]
  - **education (5)**: ["No certificate, diploma or degree", "Secondary (high) school diploma or equivalency certificate", "Apprenticeship or trades certificate or diploma", "College, "CEGEP or other non-university certificate or diploma", "Bachelor's degree or higher" ]
    took out other sections as they were redundant, or just didn't have sufficient data across the board
  - **urbanization (2)**: [ Rural areas, Urban areas ]
  - **immigration (2)**: [ Non-immigrants, Immigrants ] removed all other categories encapsulated already in immigrants
  - **work (3)**: [ Working at a paid job or business, Retired, Other activity]
