This monorepo contains multiple projects, each of which specifies its license in:

-   The project `package.json` file (for example, see [`projects/eslint-config-liferay/package.json`](./projects/eslint-config-liferay/package.json)); and:

-   In header comments in each source code file containing the [SPDX license](https://spdx.org/licenses/) information; for example:

    ```js
    /**
     * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
     * SPDX-License-Identifier: MIT
     */
    ```

Copies of the full text for each license can be found in the top-level [`LICENSES`](./LICENSES) directory.

Any source code outside of [the `projects/` directory](./projects) does not pertains to any specific project, is used in the maintenance and development of the monorepo itself, and is licensed under [the MIT license](./LICENSES/MIT.txt).
