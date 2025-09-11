import React from 'react';

interface State { hasError: boolean; info?: string }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: any) {
        this.setState({ info: String(error) });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 text-red-800 rounded-md">
                    <div className="font-semibold">Something went wrong.</div>
                    {this.state.info && <div className="text-sm mt-1">{this.state.info}</div>}
                </div>
            );
        }
        return this.props.children as any;
    }
}


