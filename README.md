# mapbox-gl-openindoor

## License and fork

This project is a fork of mapbox-gl-indoorequal repo, available here: https://github.com/indoorequal/mapbox-gl-indoorequal

See https://github.com/indoorequal/mapbox-gl-indoorequal/blob/master/LICENSE

Copyright 2020 François de Metz

## Goal

The goal of the fork is too be able to rely on geojson/mvt that are "Open Street Map compliant".

See:
* https://wiki.openstreetmap.org/wiki/Simple_Indoor_Tagging
* https://wiki.openstreetmap.org/wiki/Simple_3D_buildings

## Instances

This mapbox plugin is used in main OpenIndoor project, available here: https://app.openindoor.io


## Dev side

### Build

```
docker-compose up mapbox-gl-openindoor-build
```

### Test

```
mapbox-gl-openindoor-run
```
Then in web browser: http://localhost:8093

### Deploy

This project rely on github actions to be deployed

For local actions:

```

```