# Movie Chooser

## Features

### Design Principles

## How to Set Up

### Dependencies

### Environment File

### Commands

## Workflow

## TODO

### Requirements for 1.0

- Ensure handling of IDs of 0 is consistent for both users and movies
- Allow names to be changed and change the name of the Form component to something like AccountForm
- Make a Dockerfile and set up a GitHub action to automatically deploy this
- Documentation of EVERYTHING
- This README
- License
- Styling -- especially a better look for watching movies at night (so basically a dark mode)

### For after a 1.0 release

- See how much of the website can be migrated to use tables in place of CollapsibleSections of MovieCards (lots of room for improvement in the statistics page); this may also necessitate changing how information is split up amongst pages and what pages exist
- Certain pages (lists, stats) load slowly because they load everything; investigate how this could be sped up (for example, a lot of the stats can be pre-calculated rather than calculated right before page render)
