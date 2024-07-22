import './index.less'

export interface LoadingProps {
    spin: boolean
}
export default ({ spin, progess }: LoadingProps) => {
    return spin && (
        <div className="loader-screen">
            <div className="loading-container">
                <div className="loading" style={{
                    fontSize: 32
                }}>
                    <span style={{
                        '--i': 0
                    }}>L</span>
                    <span style={{
                        '--i': 1
                    }}>O</span>
                    <span style={{
                        '--i': 2
                    }}>A</span>
                    <span style={{
                        '--i': 3
                    }}>D</span>
                    <span style={{
                        '--i': 4
                    }}>I</span>
                    <span style={{
                        '--i': 5
                    }}>N</span>
                    <span style={{
                        '--i': 6
                    }}>G</span>
                </div>
            </div>
        </div>
    )
}