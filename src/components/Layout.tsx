import { NavBar } from './NavBar'
import { Wrapper, WrapperVariant } from './Wrapper'

interface LayoutProps {
  children?: React.ReactNode
  variant?: WrapperVariant
}

export const Layout = (props: LayoutProps): JSX.Element => {
  const { children, variant } = props
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>
        {children}
      </Wrapper>
    </>
  )
}