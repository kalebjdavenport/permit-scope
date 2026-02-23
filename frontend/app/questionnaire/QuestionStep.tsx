import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { QuestionDefinition } from "./definition"

type Props = {
  definition: QuestionDefinition
  values: string[]
  onChange: (values: string[]) => void
}

function MultiSelect({ definition, values, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {definition.options.map((opt) => (
        <Label
          key={opt.value}
          htmlFor={`${definition.id}-${opt.value}`}
          className="flex items-center gap-3 rounded-md p-3 cursor-pointer hover:bg-accent transition-colors"
        >
          <Checkbox
            id={`${definition.id}-${opt.value}`}
            checked={values.includes(opt.value)}
            onCheckedChange={(checked) => {
              onChange(
                checked
                  ? [...values, opt.value]
                  : values.filter((v) => v !== opt.value)
              )
            }}
          />
          <span>{opt.label}</span>
        </Label>
      ))}
    </div>
  )
}

function SingleSelect({ definition, values, onChange }: Props) {
  return (
    <RadioGroup value={values[0] ?? ""} onValueChange={(v) => onChange([v])}>
      {definition.options.map((opt) => (
        <Label
          key={opt.value}
          htmlFor={`${definition.id}-${opt.value}`}
          className="flex items-center gap-3 rounded-md p-3 cursor-pointer hover:bg-accent transition-colors"
        >
          <RadioGroupItem value={opt.value} id={`${definition.id}-${opt.value}`} />
          <span>{opt.label}</span>
        </Label>
      ))}
    </RadioGroup>
  )
}

export function QuestionStep({ definition, values, onChange }: Props) {
  const Component = definition.type === "multi-select" ? MultiSelect : SingleSelect

  return (
    <fieldset className="flex flex-col gap-3" aria-required="true">
      <legend className="text-base font-medium mb-1">
        {definition.question} <span className="text-destructive">*</span>
      </legend>
      <Component definition={definition} values={values} onChange={onChange} />
    </fieldset>
  )
}
