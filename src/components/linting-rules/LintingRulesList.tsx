import React, {useEffect, useMemo, useState} from 'react';
import {
  Button,
  Card,
  Checkbox,
  List,
  ListItem,
  ListItemText, TextField,
  Typography
} from "@mui/material";
import {useGetLintingRules, useModifyLintingRules} from "../../utils/queries.tsx";
import {queryClient} from "../../App.tsx";
import {Rule} from "../../types/Rule.ts";

const DEFAULT_LINT_RULES: Rule[] = [
  {
    id: "UnusedVariableCheck",
    name: "UnusedVariableCheck",
    isActive: true,
    value: null,
  },
  {
    id: "NamingFormatCheck",
    name: "NamingFormatCheck",
    isActive: false,
    value: "camelCase",
  },
  {
    id: "PrintUseCheck",
    name: "PrintUseCheck",
    isActive: false,
    value: null,
  },
  {
    id: "ReadInputCheck",
    name: "ReadInputCheck",
    isActive: false,
    value: null,
  },
];

const LintingRulesList = () => {
  const [rules, setRules] = useState<Rule[] | undefined>([]);

  const {data, isLoading} = useGetLintingRules();
  const {mutateAsync, isLoading: isLoadingMutate} = useModifyLintingRules({
    onSuccess: () => queryClient.invalidateQueries('lintingRules')
  })

  const normalizedData: Rule[] = useMemo(() => {
    if (!data || data.length === 0) return DEFAULT_LINT_RULES;
    const allowed = new Set(DEFAULT_LINT_RULES.map(r => r.name));
    const filtered = data.filter(r => allowed.has(r.name));
    return filtered.length ? filtered : DEFAULT_LINT_RULES;
  }, [data]);

  useEffect(() => {
    setRules(normalizedData)
  }, [normalizedData]);

  const handleValueChange = (rule: Rule, newValue: string | number) => {
    const newRules = rules?.map(r => {
      if (r.name === rule.name) {
        return {...r, value: newValue}
      } else {
        return r;
      }
    })
    setRules(newRules)
  };

  const handleNumberChange = (rule: Rule) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    handleValueChange(rule, isNaN(value) ? 0 : value);
  };

  const toggleRule = (rule: Rule) => () => {
    if (rule.name === "UnusedVariableCheck") {
      return; // siempre activa, no se puede desactivar
    }
    const newRules = rules?.map(r => {
      if (r.name === rule.name) {
        return {...r, isActive: !r.isActive}
      } else {
        return r;
      }
    })
    setRules(newRules)
  }

  return (
    <Card style={{padding: 16, margin: 16}}>
      <Typography variant={"h6"}>Linting rules</Typography>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {
          isLoading || isLoadingMutate ?  <Typography style={{height: 80}}>Loading...</Typography> :
          rules?.map((rule) => {
          return (
            <ListItem
              key={rule.name}
              disablePadding
              style={{height: 40}}
            >
              <Checkbox
                edge="start"
                checked={rule.isActive}
                disableRipple
                onChange={toggleRule(rule)}
              />
              <ListItemText primary={rule.name} />
              {typeof rule.value === 'number' ?
                (<TextField
                  type="number"
                  variant={"standard"}
                  value={rule.value}
                  onChange={handleNumberChange(rule)}
                />) : typeof rule.value === 'string' ?
                  (<TextField
                    variant={"standard"}
                    value={rule.value}
                    onChange={e => handleValueChange(rule, e.target.value)}
                  />) : null
              }
            </ListItem>
          )
        })}
      </List>
      <Button disabled={isLoading} variant={"contained"} onClick={() => mutateAsync(rules ?? [])}>Save</Button>
    </Card>

  );
};

export default LintingRulesList;