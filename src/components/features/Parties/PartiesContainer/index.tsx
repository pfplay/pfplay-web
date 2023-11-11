'use client';
import React, { PropsWithChildren, useState } from 'react';
import MyPlaylist from './MyPlaylist';
import PartiesSideBar from './PartiesSideBar';

const PartiesContainer = ({ children }: PropsWithChildren) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <PartiesSideBar setDrawerOpen={setDrawerOpen} />
      {children}
      <MyPlaylist {...{ drawerOpen, setDrawerOpen }} />
    </>
  );
};

export default PartiesContainer;
