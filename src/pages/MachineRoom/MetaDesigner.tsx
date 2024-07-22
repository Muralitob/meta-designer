import { Designer, graphicMenuItem } from '@/components/Designer'
import { Checkbox, Form, Input, Space } from 'antd'
export const graphicGroups: graphicMenuItem[] = [
	{
		name: "房间相关",
		show: true,
		list: [
			{
				name: "墙体",
				icon: '/public/wall.svg',
				id: "wall",
				data: {
					width: 200,
					height: 20,
					itemType: "wall",
					name: "deviceRect",
					image: '/public/wall.svg',
				},
				renderProps(changeValue, pen) {
					return (
						<Space direction="vertical">
							<Form.Item label={'是否为外墙'}>
								<Checkbox
									onChange={(e) => {
										changeValue("exteriorWall", e.target.checked)
									}}
									checked={pen.exteriorWall}></Checkbox>
							</Form.Item>
							<Form.Item label={'高度'}>
								<Input onChange={(e) => changeValue('modelHeight', e.target.value)} value={pen.modelHeight} />
							</Form.Item>
						</Space>
					)
				},
			},
			{
				name: "门",
				icon: '/public/door.svg',
				id: "door",
				data: {
					width: 100,
					height: 20,
					name: "deviceRect",
					itemType: "door",
					image: '/public/door.svg',
				},
			},
			{
				name: "灯光",
				icon: '/public/light.svg',
				id: "light",
				data: {
					width: 40,
					height: 40,
					name: "rectangle",
					itemType: "light",
					image: '/public/light.svg',
				},
			},
		],
	},
	{
		name: "机器设备",
		show: true,
		list: [
			{
				name: "机柜",
				icon: '/public/cabinet.svg',
				id: "cabinet",
				data: {
					width: 60,
					height: 120,
					itemType: "cabinet",
					name: "rectangle",
					image: '/public/cabinet.svg',
				},
				renderProps(changeValue, pen) {
					return (
						<Space direction="vertical">
							<Form.Item label={'高度'}>
								<Input onChange={(e) => changeValue('modelHeight', e.target.value)} value={pen.modelHeight} />
							</Form.Item>
							<Form.Item label={'编号'}>
								<Input onChange={(e) => changeValue('serialNumber', e.target.value)} value={pen.serialNumber} />
							</Form.Item>
						</Space>
					)
				},
			},
			{
				name: "空调",
				icon: "/public/air-conditioning.svg",
				id: "air-conditioning",
				data: {
					width: 170,
					height: 90,
					itemType: "air-conditioning",
					name: "rectangle",
					image: "/public/air-conditioning.svg",
				},
				renderProps(changeValue, pen) {
					return (
						<Space direction="vertical">
							<Form.Item label={'高度'}>
								<Input onChange={(e) => changeValue('modelHeight', e.target.value)} value={pen.modelHeight} />
							</Form.Item>
						</Space>
					)
				},
			},
			{
				name: "UPS空调",
				icon: '/public/ups-air-conditioning.svg',
				id: "ups-air-conditioning",
				data: {
					width: 50,
					height: 40,
					itemType: "ups-air-conditioning",
					name: "rectangle",
					image: '/public/ups-air-conditioning.svg'
				},
			},
			{
				name: "UPS电源",
				icon: "/public/ups.svg",
				id: "ups",
				data: {
					width: 60,
					height: 100,
					itemType: "ups",
					name: "rectangle",
					image: "/public/ups.svg",
				},
			},
			{
				name: "温湿度传感器",
				icon: "/public/th-sensor.svg",
				id: "th-sensor",
				data: {
					width: 40,
					height: 40,
					itemType: "th-sensor",
					name: "rectangle",
					image: "/public/th-sensor.svg",
				},
			},
			{
				name: "电柜",
				icon: "/public/electric-box.svg",
				id: "electric-box",
				data: {
					width: 80,
					height: 80,
					itemType: "electric-box",
					name: "rectangle",
					image: "/public/electric-box.svg",
				},
			},
		],
	},
]
export default () => {
	return (
		<Designer handleSave={(data) => {
			localStorage.setItem('mroom', JSON.stringify(data))
		}} onLoad={() => {
			let data = JSON.parse(localStorage.getItem('mroom') ?? 'null')
			window.meta2d.open(data)
		}} graphicMenu={graphicGroups} />
	)
}