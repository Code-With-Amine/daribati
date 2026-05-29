declare module '@tabler/icons-react' {
  import { FC, SVGProps } from 'react'
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
    stroke?: number | string
    color?: string
    className?: string
  }
  export type Icon = FC<IconProps>
  export const IconDashboard: Icon
  export const IconListDetails: Icon
  export const IconUsers: Icon
  export const IconChartBar: Icon
  export const IconSettings: Icon
  export const IconHelp: Icon
  export const IconSearch: Icon
  export const IconDatabase: Icon
  export const IconReport: Icon
  export const IconCalculator: Icon
  export const IconBuilding: Icon
  export const IconMessage: Icon
  export const IconHome: Icon
  export const IconFileDescription: Icon
}
