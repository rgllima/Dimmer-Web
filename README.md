# The DyMMer Web

The DyMMer Web is an open source project that extends the DyMMer framework by adding 4 measures of variability to evaluate feature models. The tool provides an easy-to-use web interface for creating and editing feature models of Domain-Specific Product Lines (DSPL) and Software Product Lines (SPL). The DyMMer Web also offers a repository for storing SPL and DSPL models, serving the scientific community for future studies.

In this new version, quality measures have been implemented in a more modular way, making it simpler and more straightforward to include or withdraw new measures in the future. The DyMMer Web also integrates the VALE method for deriving thresholds for each measure and can automatically recalculate thresholds when new feature models are imported. Additionally, the project extends the MAcchiATO dataset, MiniCoFFEE, for evaluating the maintainability of feature models in SPL.

## Table of Contents
- [Project setup](#project-setup)
- [Development](#development)
- [Production](#production)
- [Testing](#testing)
- [Linting](#linting)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Demo](#demo)

## Project setup
To set up the project, first clone the repository and then run the following command to install the required dependencies:
```
yarn install
```

## Development
To compile the project and enable hot-reloads for development, run the following command:
```
yarn run serve
```

## Production
To compile and minify the project for production, run the following command:
```
yarn run build
```

## Testing
To run your tests, use the following command:
```
yarn run test
```

## Linting
To lint and fix files, use the following command:
```
yarn run lint
```

## Configuration
For customization options and configurations, please see the [Configuration Reference](https://cli.vuejs.org/config/).

## Deployment
To deploy the project, follow these steps:

1. Configure an SSH key in your GitHub account. Refer to [GitHub's documentation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) for guidance.
2. Execute the `deploy.sh` script:
   ```
   yarn build
   cd dist
   git init
   git add -A
   git commit -m 'deploy'
   git push -f git@github.com:dymmerufc/dymmerufc.github.io.git master
   cd -
   ```
   Note: If your local branch name is `master` instead of `main`, adjust the script accordingly.

The backend is running at https://www.cyclic.sh/.

## Demo
To access the tool, visit https://dymmerufc.github.io/, click on the "Dashboard" button, and log in with the following demo credentials:

- Demo User: demo@email.com
- Demo User Password: dRtgski987YYT
