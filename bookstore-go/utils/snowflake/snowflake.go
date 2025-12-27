package snowflake

import (
	"time"

	sf "github.com/bwmarrin/snowflake"
)

var node *sf.Node

// Init 初始化雪花算法节点
// startTime: 起始时间 (格式: "2023-01-01")，生成的 ID 会基于这个时间
// machineID: 机器 ID (在一个分布式系统中，每台机器的 ID 必须不同，范围 0-1023)
func Init(startTime string, machineID int64) (err error) {
	var st time.Time
	// 1. 自定义起始时间
	st, err = time.Parse("2006-01-02", startTime)
	if err != nil {
		return
	}
	sf.Epoch = st.UnixNano() / 1000000

	// 2. 创建节点
	node, err = sf.NewNode(machineID)
	return
}

// GenID 生成 64 位 ID
func GenID() int64 {
	return node.Generate().Int64()
}
