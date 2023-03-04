import { ComponentMeta, ComponentStory } from '@storybook/react'

import NotFound from './NotFound'

export default {
  title: 'Error/NotFound',
  component: NotFound,
} as ComponentMeta<typeof NotFound>

const Template: ComponentStory<typeof NotFound> = () => <NotFound />

export const Default = Template.bind({})
Default.storyName = 'NotFound'
