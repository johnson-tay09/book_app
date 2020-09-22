# The Book App

**Author**: Taylor Johnson, Specner Lazzar
**Version**: 1.0.0
Write the JS and EJS to pull book queries from google API. Search by title or author.

## Feature Task Time Estimate

Feature #1: Setup the repo

Estimate of time needed to complete: 10min.

Start time:1:00

Finish time:1:10

Actual time needed to complete:10min

Feature #2: Create basic server with search results

Estimate of time needed to complete: 2hours.

Start time:1:10

Finish time:4:10

Actual time needed to complete:180min

Feature #3: Style with CSS for mobile and desktop

Estimate of time needed to complete: 1hours.

Start time:4:10

Finish time:5:40

Actual time needed to complete:90min

**Version**: 1.1.0
Incorporate Database

## Feature Task Time Estimate

Feature #1: Setup Database

Estimate of time needed to complete: 2hr.

Start time:12:30

Finish time:2:00

Actual time needed to complete:90min

Feature #2: Single Book Render

Estimate of time needed to complete: 2hr.

Start time:2:00

Finish time:2:30

Actual time needed to complete:30min

## Schema

DROP TABLE IF EXISTS books;

CREATE TABLE books(
id SERIAL PRIMARY KEY,
author VARCHAR(255),
title VARCHAR(255),
isbn VARCHAR(255),
img_url VARCHAR(255),
description TEXT
)

## Overview

<!-- Provide a high level overview of what this application is and why you are building it, beyond the fact that it's an assignment for a Code 301 class. (i.e. What's your problem domain?) -->

## Getting Started

<!-- What are the steps that a user must take in order to build this app on their own machine and get it running? -->

## Architecture

<!-- Provide a detailed description of the application design. What technologies (languages, libraries, etc) you're using, and any other relevant design information. -->

## Change Log

<!-- Use this area to document the iterative changes made to your application as each feature is successfully implemented. Use time stamps. Here's an examples:

01-01-2001 4:59pm - Application now has a fully-functional express server, with GET and POST routes for the book resource.

## Credits and Collaborations
<!-- Give credit (and a link) to other people or resources that helped you build this application. -->
