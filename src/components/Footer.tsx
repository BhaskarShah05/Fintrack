import React from 'react';
import { CinematicFooter, CinematicFooterProps } from './ui/motion-footer';

export const Footer: React.FC<CinematicFooterProps> = (props) => {
  return <CinematicFooter {...props} />;
};

export { CinematicFooter };
export default Footer;
