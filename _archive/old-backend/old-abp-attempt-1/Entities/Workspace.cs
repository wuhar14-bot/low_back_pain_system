using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace LowBackPainSystem.Entities
{
    /// <summary>
    /// 工作室实体
    /// Workspace entity
    /// </summary>
    public class Workspace : FullAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// 工作室名称
        /// Workspace name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 工作室代码 (唯一)
        /// Workspace code (unique identifier)
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// 是否启用
        /// Is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// 描述
        /// Description
        /// </summary>
        public string Description { get; set; }

        protected Workspace()
        {
        }

        public Workspace(
            Guid id,
            string name,
            string code
        ) : base(id)
        {
            Name = name;
            Code = code;
            IsActive = true;
        }

        public void SetActive(bool isActive)
        {
            IsActive = isActive;
        }
    }
}
