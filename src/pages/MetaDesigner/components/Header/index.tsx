import {
  LeftOutlined,
  PlayCircleOutlined,
  RightOutlined,
  SaveOutlined,
  ShrinkOutlined,
  SyncOutlined,
  AppstoreOutlined
} from "@ant-design/icons"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Moon, Sun } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const [scale, setScale] = useState(0)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.meta2d) {
        clearInterval(timer)
        // 获取初始缩放比例
        scaleSubscriber(window.meta2d.store.data.scale)
        // 监听缩放
        // @ts-ignore
        meta2d.on("scale", scaleSubscriber)
      }
    }, 200)
  }, [])

  const scaleSubscriber = (val: number) => {
    setScale(Math.round(val * 100))
  }

  const onRedo = () => {
    window.meta2d.redo()
  }

  const onUndo = () => {
    window.meta2d.undo()
  }

  const onScaleDefault = () => {
    window.meta2d.scale(1)
    window.meta2d.centerView()
  }

  const onScaleWindow = () => {
    window.meta2d.fitView()
  }

  function handleSave() {
    let data = window.meta2d.data()
    // TODO: 替换为shadcn/ui的toast
    window.alert("保存成功")
    localStorage.setItem("metaData", JSON.stringify(data))
  }

  function handleView() {
    let data = window.meta2d.data()
    localStorage.setItem("metaData", JSON.stringify(data))
    navigate('/room')
  }

  return (
    <div className="relative z-10 flex h-12 items-center justify-between border-b border-zinc-200 bg-white px-6 text-zinc-900 shadow-lg dark:border-white/10 dark:bg-gradient-to-r dark:from-zinc-900 dark:to-zinc-800 dark:text-white transition-colors">
      <div className="flex items-center gap-2">
        <AppstoreOutlined className="text-2xl text-blue-500" />
        <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-lg font-medium text-transparent">
          Meta Designer
        </span>
      </div>
      
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-md text-inherit hover:bg-zinc-100 hover:text-blue-400 dark:hover:bg-white/10"
                  onClick={onUndo}
                >
                  <LeftOutlined className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>撤回</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-inherit hover:bg-zinc-100 hover:text-blue-400 dark:hover:bg-white/10"
                  onClick={onRedo}
                >
                  <RightOutlined className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>重做</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-white/20" />

          <div className="flex items-center gap-1">
            <div className="flex h-8 min-w-[60px] items-center justify-center rounded bg-zinc-100 px-3 font-mono text-sm dark:bg-white/10">
              {scale}%
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-inherit hover:bg-zinc-100 hover:text-blue-400 dark:hover:bg-white/10"
                  onClick={onScaleDefault}
                >
                  <SyncOutlined className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>100%视图</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-inherit hover:bg-zinc-100 hover:text-blue-400 dark:hover:bg-white/10"
                  onClick={onScaleWindow}
                >
                  <ShrinkOutlined className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>窗口大小</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-white/20" />

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-inherit hover:bg-zinc-100 hover:text-blue-400 dark:hover:bg-white/10"
                  onClick={handleSave}
                >
                  <SaveOutlined className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>保存</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="default"
              className="ml-2 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={handleView}
            >
              <PlayCircleOutlined className="h-4 w-4" />
              预览3D效果
            </Button>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-white/20" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-inherit hover:bg-zinc-100 hover:text-yellow-500 dark:hover:bg-white/10"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="切换主题"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme === 'dark' ? '切换为白天模式' : '切换为夜间模式'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
