import * as React from 'react';
import { fireEvent } from '@testing-library/react';
import { linkToRecord } from 'ra-core';
import { renderWithRedux } from 'ra-test';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import DatagridRow from './DatagridRow';
import DatagridContextProvider from './DatagridContextProvider';

const TitleField = ({ record }: any): JSX.Element => (
    <span>{record.title}</span>
);
const ExpandPanel = () => <span>expanded</span>;

// remove validateDomNesting warnings by react-testing-library
const render = element =>
    renderWithRedux(
        <table>
            <tbody>{element}</tbody>
        </table>,
        {
            admin: {
                resources: {
                    posts: {
                        list: {
                            expanded: [],
                        },
                    },
                },
            },
        }
    );

describe('<DatagridRow />', () => {
    const defaultProps = {
        id: 15,
        basePath: '/blob',
        record: { id: 15, title: 'hello' },
        resource: 'posts',
    };

    const dataGridContextValue = { isRowExpandable: undefined };

    const renderWithRouter = children => {
        const history = createMemoryHistory();

        return {
            history,
            ...render(<Router history={history}>{children}</Router>),
        };
    };

    describe('rowClick', () => {
        it("should redirect to edit page if the 'edit' option is selected", () => {
            const { getByText, history } = renderWithRouter(
                <DatagridContextProvider value={dataGridContextValue}>
                    <DatagridRow {...defaultProps} rowClick="edit">
                        <TitleField />
                    </DatagridRow>
                </DatagridContextProvider>
            );
            fireEvent.click(getByText('hello'));
            expect(history.location.pathname).toEqual(
                linkToRecord(defaultProps.basePath, defaultProps.id)
            );
        });

        it("should redirect to show page if the 'show' option is selected", () => {
            const { getByText, history } = renderWithRouter(
                <DatagridContextProvider value={dataGridContextValue}>
                    <DatagridRow {...defaultProps} rowClick="show">
                        <TitleField />
                    </DatagridRow>
                </DatagridContextProvider>
            );
            fireEvent.click(getByText('hello'));
            expect(history.location.pathname).toEqual(
                linkToRecord(defaultProps.basePath, defaultProps.id, 'show')
            );
        });

        it("should change the expand state if the 'expand' option is selected", () => {
            const { queryAllByText, getByText } = renderWithRouter(
                <DatagridContextProvider value={dataGridContextValue}>
                    <DatagridRow
                        {...defaultProps}
                        rowClick="expand"
                        expand={<ExpandPanel />}
                    >
                        <TitleField />
                    </DatagridRow>
                </DatagridContextProvider>
            );
            expect(queryAllByText('expanded')).toHaveLength(0);
            fireEvent.click(getByText('hello'));
            expect(queryAllByText('expanded')).toHaveLength(1);
            fireEvent.click(getByText('hello'));
            expect(queryAllByText('expanded')).toHaveLength(0);
        });

        it("should execute the onToggleItem function if the 'toggleSelection' option is selected", () => {
            const onToggleItem = jest.fn();
            const { getByText } = renderWithRouter(
                <DatagridContextProvider value={dataGridContextValue}>
                    <DatagridRow
                        {...defaultProps}
                        onToggleItem={onToggleItem}
                        rowClick="toggleSelection"
                    >
                        <TitleField />
                    </DatagridRow>
                </DatagridContextProvider>
            );
            fireEvent.click(getByText('hello'));
            expect(onToggleItem.mock.calls.length).toEqual(1);
        });

        it('should not execute the onToggleItem function if the row is not selectable', () => {
            const onToggleItem = jest.fn();
            const { getByText } = renderWithRouter(
                <DatagridContextProvider value={dataGridContextValue}>
                    <DatagridRow
                        {...defaultProps}
                        selectable={false}
                        onToggleItem={onToggleItem}
                        rowClick="toggleSelection"
                    >
                        <TitleField />
                    </DatagridRow>
                </DatagridContextProvider>
            );
            fireEvent.click(getByText('hello'));
            expect(onToggleItem).not.toHaveBeenCalled();
        });

        it('should redirect to the custom path if onRowClick is a string', () => {
            const path = '/foo/bar';
            const { getByText, history } = renderWithRouter(
                <DatagridContextProvider value={dataGridContextValue}>
                    <DatagridRow {...defaultProps} rowClick={path}>
                        <TitleField />
                    </DatagridRow>
                </DatagridContextProvider>
            );
            fireEvent.click(getByText('hello'));
            expect(history.location.pathname).toEqual(path);
        });

        it('should evaluate the function and redirect to the result of that function if onRowClick is a custom function', async () => {
            const customRowClick = () => '/bar/foo';
            const { getByText, history } = renderWithRouter(
                <DatagridContextProvider value={dataGridContextValue}>
                    <DatagridRow {...defaultProps} rowClick={customRowClick}>
                        <TitleField />
                    </DatagridRow>
                </DatagridContextProvider>
            );
            fireEvent.click(getByText('hello'));
            await new Promise(setImmediate); // waitFor one tick
            expect(history.location.pathname).toEqual('/bar/foo');
        });

        it('should not call push if onRowClick is falsy', () => {
            const { getByText, history } = renderWithRouter(
                <DatagridContextProvider value={dataGridContextValue}>
                    <DatagridRow {...defaultProps} rowClick="">
                        <TitleField />
                    </DatagridRow>
                </DatagridContextProvider>
            );
            fireEvent.click(getByText('hello'));
            expect(history.location.pathname).toEqual('/');
        });
    });
});
