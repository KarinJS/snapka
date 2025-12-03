#!/usr/bin/env node

/**
 * @license
 * Copyright 2023 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CLI } from './CLI.js'

// eslint-disable-next-line no-void
void new CLI().run(process.argv)
