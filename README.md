# setup-shfmt

This action downloads [shfmt](https://github.com/mvdan/sh) binary and adds it
to the PATH.

## Inputs

| Name            | Type   | Description                              |
| --------------- | ------ | ---------------------------------------- |
| `shfmt-version` | String | The version to use or `latest` (default) |

## Outputs

## Example usage

To use the latest `shfmt`:

```yaml
steps:
  - uses: mfinelli/setup-shfmt@v2
  - run: shfmt -d script.bash
```

Or with a specific version:

```yaml
steps:
  - uses: mfinelli/setup-shfmt@v2
    with:
      shfmt-version: 3.3.1
  - run: shfmt -d script.bash
```
